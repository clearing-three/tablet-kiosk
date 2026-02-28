# Error Handling Refactor Plan

## Goal

Replace distributed, inconsistent error handling with a centralized strategy:
errors propagate to the root of each call stack, where they are logged to the
console and displayed in a stack of dismissible error bars at the top of the
screen. Each error source has its own bar, managed independently.

---

## Call Stack Roots

There are two recurring call stack roots and one startup root:

| Root | Source key | Location | Trigger |
|---|---|---|---|
| App startup | `'init'` | `DOMContentLoaded` handler in `main.ts` | Page load |
| Weather update | `'weather-update'` | `updateWeatherData()` in `main.ts` | `setInterval` every 10 min |
| Clock update | `'clock-update'` | `startUpdates()` interval in `TimeDisplay.ts` | `setInterval` every 1 sec |

All error handling will be consolidated at these three roots.

---

## Error Display Strategy

Each source has its own error bar. Bars stack vertically at the top of the
screen. Multiple simultaneous failures are each visible and readable
independently.

- `show(source, error)` — upserts the bar for that source; a new error from
  the same source replaces the previous one
- `remove(source)` — removes the bar for that source; called both on successful
  operation and when the user clicks the × button on a bar

A clock success only removes a clock bar; a weather success only removes a
weather bar. Sources cannot accidentally remove each other's bars. The `init`
source never calls `remove` since there is no subsequent success after startup.

---

## ✅ Step 1 — Create `ErrorDisplay` component

**New file: `src/components/ErrorDisplay.ts`**

The `ErrorDisplay` manages a container element holding one bar per active error
source. It is instantiated once at the top of `DOMContentLoaded`, before
`TabletKioskApp` is created, so it is available even if app construction fails.

Exported type (used by `main.ts` call sites):
```ts
export type ErrorSource = 'init' | 'weather-update' | 'clock-update'
```

Public API:
```ts
show(source: ErrorSource, error: unknown): void
remove(source: ErrorSource): void
```

Internal state:
- A `Map<ErrorSource, HTMLElement>` of source key → bar element
- The container is a `<div>` inserted as the first child of `<body>`,
  `position: fixed` so bars overlay the layout without shifting content

Error extraction helper (private, defined in the same file):
```ts
function getErrorDetails(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) return { message: error.message, stack: error.stack }
  return { message: String(error) }
}
```
`show()` calls this to extract the message and stack before building the bar element.

Per-bar structure:
- Summary row: `[source label] [error message] [▼/▲ toggle] [× dismiss]`
- Collapsible `<pre>` block with the full stack trace (hidden by default; omitted if no stack)
- The toggle button expands/collapses the detail block
- The dismiss button calls `remove(source)` and removes the bar

### Tests — `ErrorDisplay`

**New file: `src/components/ErrorDisplay.test.ts`**

- `show()` appends a bar element to the container
- `show()` called twice with the same source replaces the existing bar (one bar, not two)
- `show()` called with two different sources produces two independent bars
- `remove()` removes the bar for that source; no other bars are affected
- `remove()` on a source with no active bar is a no-op
- Bar renders the error message text
- Bar includes a `<pre>` element containing the stack trace when the error is an `Error` instance
- Bar omits the `<pre>` element when the error is a plain string
- Toggle button hides and shows the `<pre>` element on successive clicks
- Dismiss button removes the bar from the DOM

---

## ✅ Step 2 — Add CSS for the error display

**File: `src/styles/main.css`**

Add styles for the error display container and individual bars:
- Container: `position: fixed; top: 0; left: 0; width: 100%; z-index: 100;`
  `display: flex; flex-direction: column`
- Each bar: distinct background (dark red/amber), high-contrast text, full
  width
- Summary row: flex layout with message taking remaining space, buttons
  right-aligned
- Detail block (`<pre>`): hidden by default, monospace font, scrollable,
  max-height capped so a single expanded bar cannot cover the entire screen
- Verify `z-index: 100` does not conflict with any other fixed/absolute elements
  in the existing layout; audit `index.html` and existing CSS before settling on
  a value
- Dismiss and toggle buttons must meet minimum touch target size (44×44px) for
  reliable tap interaction on the kiosk touchscreen

---

## ✅ Step 3 — Update `DOMContentLoaded` handler in `main.ts`

**File: `src/main.ts`**

- Instantiate `ErrorDisplay` at the top of the handler (before `TabletKioskApp`)
- Pass `errorDisplay` into `TabletKioskApp` constructor
- Replace the `body.innerHTML` fallback in the catch block with:
  ```ts
  console.error('Failed to start application:', error)
  errorDisplay.show('init', error)
  ```

---

## ✅ Step 4 — Update `TabletKioskApp` in `main.ts`

**File: `src/main.ts`**

- Add `private errorDisplay: ErrorDisplay` field; accept it via constructor
  parameter
- In `updateWeatherData()`: replace the existing try/catch (which only logs)
  with:
  ```ts
  try {
    // ... existing update calls
    this.errorDisplay.remove('weather-update')
  } catch (error) {
    console.error('Failed to update weather data:', error)
    this.errorDisplay.show('weather-update', error)
  }
  ```
- In `initialize()`: the existing try/catch re-throws cleanly; keep it as-is
  since the `DOMContentLoaded` handler owns the `init` bar

### Tests — `TabletKioskApp.updateWeatherData()`

In the existing `TabletKioskApp` test file (or create one). Pass a mock
`ErrorDisplay` via the constructor.

- When all update calls succeed, `errorDisplay.remove('weather-update')` is called
- When any update call throws, `errorDisplay.show('weather-update', error)` is called
  with the thrown error
- A subsequent successful call after a failure calls `remove`, not `show`

---

## ✅ Step 5 — Wire clock error handling into `TabletKioskApp`

This step has two parts: update `TimeDisplay` to expose error/success callbacks,
then add `errorDisplay` to `TabletKioskApp` so it can wire them up.

### Part A — Update `TimeDisplay`

**File: `src/components/Time/TimeDisplay.ts`**

`TimeDisplay` manages its own interval, so its interval callback is the root
for clock errors. Add optional callbacks to `startUpdates()`:

```ts
startUpdates(onError?: (error: unknown) => void, onSuccess?: () => void): void
```

The interval body becomes:
```ts
// Declared outside the interval callback so it persists across ticks
let lastUpdateFailed = false
setInterval(() => {
  try {
    this.updateDisplay()
    if (lastUpdateFailed) {
      lastUpdateFailed = false
      onSuccess?.()
    }
  } catch (error) {
    lastUpdateFailed = true
    onError?.(error)
  }
}, 1000)
```

### Part B — Add `errorDisplay` to `TabletKioskApp`

**File: `src/main.ts`**

`TabletKioskApp` is the orchestrator for clock error handling, the same role
`WeatherUpdateCoordinator` plays for weather errors. Add `errorDisplay` as an
injected constructor parameter, following the same pattern:

```ts
constructor(
  private readonly domValidator: DOMValidator,
  private readonly assetValidator: AssetValidator,
  private readonly weatherCoordinator: WeatherUpdateCoordinator,
  private readonly weatherScheduler: UpdateScheduler,
  private readonly timeDisplay: TimeDisplay,
  private readonly errorDisplay: ErrorDisplay
) {}
```

In `initialize()`, pass callbacks to `startUpdates()`:
```ts
this.timeDisplay.startUpdates(
  (error) => {
    console.error('Time display error:', error)
    this.errorDisplay.show('clock-update', error)
  },
  () => this.errorDisplay.remove('clock-update')
)
```

In `createApp()`, pass the existing `errorDisplay` instance (already created
there and passed to `WeatherUpdateCoordinator`) as the final argument to
`TabletKioskApp`.

### Tests — `TimeDisplay.startUpdates()`

In the existing `TimeDisplay` test file. Use fake timers to advance the
interval manually.

- `onError` is called with the thrown error when `updateDisplay()` throws
- `onSuccess` is called on the tick after a failed tick when `updateDisplay()`
  succeeds (recovery)
- `onSuccess` is NOT called on a successful tick that was not preceded by a
  failure
- `onError` is called on every failing tick, not just the first one
- Neither callback is invoked when `startUpdates()` is called with no arguments

### Tests — `TabletKioskApp` (update existing test file)

Add `mockErrorDisplay: Pick<ErrorDisplay, 'show' | 'remove'>` to the test
setup and pass it as the sixth constructor argument in `makeApp()`.

- `initialize()` passes an `onError` callback to `startUpdates()` that calls
  `errorDisplay.show('clock-update', error)`
- `initialize()` passes an `onSuccess` callback to `startUpdates()` that calls
  `errorDisplay.remove('clock-update')`

---

## Step 6 — Strip error handling from `WeatherDisplay`

**File: `src/components/Weather/WeatherDisplay.ts`**

- Before removing, grep for all usages of the exported error string constants
  (`WEATHER_ERROR_TEMP` etc.) across the codebase (including tests) to confirm
  they are not consumed elsewhere
- Remove the three exported error string constants
- Remove `showErrorState()`
- In `updateDisplay()`: remove the try/catch wrapper; let errors throw

### Tests — `WeatherDisplay`

Update the existing `WeatherDisplay` test file.

- `updateDisplay()` throws (rather than rendering an error state) when passed
  invalid or missing data
- Confirm no test still references the removed error string constants
  (`WEATHER_ERROR_TEMP` etc.); delete any that do

---

## Step 7 — Strip error handling from `WeatherForecast`

**File: `src/components/Weather/WeatherForecast.ts`**

- Remove `showErrorState()`
- In `validateForecastData()`: change from returning `boolean` to throwing
  descriptive `Error`s (e.g. `throw new Error('Forecast data is empty')`)
- In `updateForecast()`: remove try/catch and the `showErrorState()` fallback;
  call `validateForecastData()` and let it throw on bad data

### Tests — `WeatherForecast`

Update the existing `WeatherForecast` test file.

- `validateForecastData()` throws an `Error` with a descriptive message when
  data is empty
- `validateForecastData()` throws an `Error` with a descriptive message when
  data is malformed
- `updateForecast()` propagates the error thrown by `validateForecastData()`
  (does not swallow it)

---

## Step 8 — Strip error handling from `AstronomyTimes`

**File: `src/components/Astronomy/AstronomyTimes.ts`**

- Remove `showErrorState()`
- In `validateAstronomyData()`: change from returning `boolean` to throwing
  descriptive `Error`s
- In `updateTimes()`: remove the `if (!validate) { showErrorState() }` guard;
  call `validateAstronomyData()` and let it throw

### Tests — `AstronomyTimes`

Update the existing `AstronomyTimes` test file.

- `validateAstronomyData()` throws an `Error` with a descriptive message for
  each invalid data case
- `updateTimes()` propagates the error thrown by `validateAstronomyData()`

---

## Step 9 — Strip error handling from `MoonPhase`

**File: `src/components/Astronomy/MoonPhase.ts`**

- Remove `showErrorState()`
- In `validatePhaseValue()`: change from returning `boolean` to throwing
- In `updatePhase()`: remove the `if (!validate) { showErrorState() }` guard
- In `updatePhaseName()`: remove try/catch; let errors throw
- In `renderMoonSVG()`: remove try/catch and `showErrorState()` calls; throw
  if library is unavailable

### Tests — `MoonPhase`

Update the existing `MoonPhase` test file.

- `validatePhaseValue()` throws an `Error` with a descriptive message for an
  invalid phase value
- `updatePhase()` propagates the error thrown by `validatePhaseValue()`
- `updatePhaseName()` propagates errors rather than swallowing them
- `renderMoonSVG()` throws when the moon SVG library is unavailable

---

## Files Changed Summary

| File | Change |
|---|---|
| `src/components/ErrorDisplay.ts` | **New** — stacked error bar manager |
| `src/components/ErrorDisplay.test.ts` | **New** — unit tests for ErrorDisplay |
| `src/styles/main.css` | Add error display styles |
| `src/main.ts` | Centralise error handling; wire up ErrorDisplay |
| `src/main.test.ts` | Update / add tests for TabletKioskApp.updateWeatherData |
| `src/components/Time/TimeDisplay.ts` | Add onError/onSuccess callbacks to startUpdates |
| `src/components/Time/TimeDisplay.test.ts` | Update tests for startUpdates callbacks |
| `src/components/Weather/WeatherDisplay.ts` | Remove showErrorState, error constants, try/catch |
| `src/components/Weather/WeatherDisplay.test.ts` | Update tests; remove references to error constants |
| `src/components/Weather/WeatherForecast.ts` | Remove showErrorState; validateForecastData throws |
| `src/components/Weather/WeatherForecast.test.ts` | Update tests; verify throwing behaviour |
| `src/components/Astronomy/AstronomyTimes.ts` | Remove showErrorState; validateAstronomyData throws |
| `src/components/Astronomy/AstronomyTimes.test.ts` | Update tests; verify throwing behaviour |
| `src/components/Astronomy/MoonPhase.ts` | Remove showErrorState; validators throw |
| `src/components/Astronomy/MoonPhase.test.ts` | Update tests; verify throwing behaviour |

`src/index.html` — no changes needed (ErrorDisplay injects its own element).
