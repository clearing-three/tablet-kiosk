# Refactoring Proposal: main.ts for Improved Testability

## Current Testability Issues

### 1. **Too Many Responsibilities**
The `TabletKioskApp` class currently handles:
- Service instantiation
- Component initialization
- DOM validation
- Asset validation
- Update scheduling
- Error handling
- Lifecycle management

This violates the Single Responsibility Principle and makes testing difficult.

### 2. **Hard-to-Test Private Methods**
Critical logic is in private methods (`updateWeatherData`, `validateDOMElements`, `validateAssets`), making them inaccessible to unit tests.

### 3. **Hard-Coded Dependencies**
- Services are instantiated directly in the constructor
- Components are created in `initialize()`
- Direct use of `window` and `document` globals
- Hard-coded intervals (`weatherUpdateIntervalMs`)

### 4. **Tightly Coupled Components**
Components are created and initialized in a single method, making it impossible to test orchestration logic independently.

### 5. **Mixed Concerns**
Business logic, DOM manipulation, scheduling, and error handling are all intertwined.

## Proposed Refactoring Strategy

### Phase 1: Extract Configuration

**Create `AppConfig` interface:**
```typescript
interface AppConfig {
  weatherUpdateIntervalMs: number
}

const DEFAULT_APP_CONFIG: AppConfig = {
  weatherUpdateIntervalMs: 10 * 60 * 1000
}
```

### Phase 2: Extract Validators

**Create `DOMValidator` class:**
```typescript
export class DOMValidator {
  validate(elementIds: string[]): { valid: boolean; missing: string[] } {
    const missing: string[] = []

    for (const id of elementIds) {
      if (!document.getElementById(id)) {
        missing.push(id)
      }
    }

    return { valid: missing.length === 0, missing }
  }
}
```

Benefits:
- Can be tested independently with jsdom
- Accepts element IDs as parameters (no hard-coded dependencies)
- Returns data rather than logging (separation of concerns)

**Create `AssetValidator` class:**
```typescript
export class AssetValidator {
  async validateAll(assetUrls: string[]): Promise<{ valid: boolean; missing: string[] }> {
    const missing: string[] = []

    const validationPromises = assetUrls.map(async url => {
      const exists = await validateAssetExists(url)
      if (!exists) {
        missing.push(url)
      }
    })

    await Promise.all(validationPromises)

    return { valid: missing.length === 0, missing }
  }
}
```

### Phase 3: Extract Update Scheduling

**Create `UpdateScheduler` class:**
```typescript
export class UpdateScheduler {
  private intervalId: number | null = null

  constructor(private readonly intervalMs: number) {}

  start(callback: () => void | Promise<void>): void {
    this.stop()
    callback() // Initial call
    this.intervalId = window.setInterval(callback, this.intervalMs)
  }

  stop(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  isRunning(): boolean {
    return this.intervalId !== null
  }
}
```

Benefits:
- Easily testable with fake timers
- Reusable for other update scenarios
- Clear interface

### Phase 4: Extract Component Factory

**Create `ComponentFactory` class:**
```typescript
export class ComponentFactory {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly moonPhaseService: MoonPhaseService
  ) {}

  createWeatherDisplay(): WeatherDisplay {
    return new WeatherDisplay(this.weatherService)
  }

  createWeatherForecast(): WeatherForecast {
    return new WeatherForecast(this.weatherService)
  }

  createAstronomyTimes(): AstronomyTimes {
    return new AstronomyTimes()
  }

  createMoonPhase(): MoonPhase {
    return new MoonPhase(this.moonPhaseService)
  }

  createTimeDisplay(): TimeDisplay {
    return new TimeDisplay()
  }
}
```

Benefits:
- Centralizes component creation
- Easy to mock for testing
- Can be extended for different component configurations

### Phase 5: Extract Weather Update Coordination

**Create `WeatherUpdateCoordinator` class:**
```typescript
export class WeatherUpdateCoordinator {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly weatherDisplay: WeatherDisplay,
    private readonly weatherForecast: WeatherForecast,
    private readonly astronomyTimes: AstronomyTimes,
    private readonly moonPhase: MoonPhase,
    private readonly errorDisplay: ErrorDisplay
  ) {}

  async update(): Promise<void> {
    try {
      const weatherData = await this.weatherService.getProcessedWeatherData()

      this.weatherDisplay.updateDisplay(weatherData.current)
      this.weatherForecast.updateForecast(weatherData.forecast)
      this.astronomyTimes.updateTimes(weatherData.astronomy)
      this.moonPhase.updatePhase(weatherData.astronomy.moonPhase)

      this.errorDisplay.remove('weather-update')
    } catch (error) {
      this.errorDisplay.show('weather-update', error)
      throw error // Re-throw for scheduler to handle if needed
    }
  }
}
```

Benefits:
- Single responsibility: coordinate weather updates
- All dependencies injected (easily mockable)
- Can be tested without the full app

### Phase 6: Refactor TabletKioskApp

**New simplified `TabletKioskApp`:**
```typescript
export class TabletKioskApp {
  private weatherScheduler: UpdateScheduler
  private weatherCoordinator: WeatherUpdateCoordinator
  private timeDisplay: TimeDisplay

  constructor(
    private readonly config: AppConfig,
    private readonly domValidator: DOMValidator,
    private readonly assetValidator: AssetValidator,
    private readonly componentFactory: ComponentFactory,
    weatherService: WeatherService,
    errorDisplay: ErrorDisplay
  ) {
    // Create components
    const weatherDisplay = this.componentFactory.createWeatherDisplay()
    const weatherForecast = this.componentFactory.createWeatherForecast()
    const astronomyTimes = this.componentFactory.createAstronomyTimes()
    const moonPhase = this.componentFactory.createMoonPhase()
    this.timeDisplay = this.componentFactory.createTimeDisplay()

    // Create coordinator
    this.weatherCoordinator = new WeatherUpdateCoordinator(
      weatherService,
      weatherDisplay,
      weatherForecast,
      astronomyTimes,
      moonPhase,
      errorDisplay
    )

    // Create scheduler
    this.weatherScheduler = new UpdateScheduler(config.weatherUpdateIntervalMs)
  }

  async initialize(): Promise<void> {
    // Validate DOM
    const domValidation = this.domValidator.validate(Object.values(DOM_IDS))
    if (!domValidation.valid) {
      throw new Error(`Missing DOM elements: ${domValidation.missing.join(', ')}`)
    }

    // Validate assets (non-blocking)
    this.validateAssetsAsync()

    // Preload assets
    preloadCriticalAssets()

    // Start updates
    this.timeDisplay.startUpdates()
    this.weatherScheduler.start(() => this.weatherCoordinator.update())
  }

  private async validateAssetsAsync(): Promise<void> {
    try {
      const assetValidation = await this.assetValidator.validateAll(
        getCriticalAssetUrls()
      )
      if (!assetValidation.valid) {
        reportMissingAssets(assetValidation.missing)
      }
    } catch (error) {
      console.warn('Asset validation failed:', error)
    }
  }

  destroy(): void {
    this.weatherScheduler.stop()
    this.timeDisplay.destroy()
  }

  async refresh(): Promise<void> {
    await this.weatherCoordinator.update()
    this.timeDisplay.updateDisplay()
  }
}
```

### Phase 7: Update Application Bootstrap

**New bootstrap code:**
```typescript
function createApp(): TabletKioskApp {
  const errorDisplay = new ErrorDisplay()

  // Create services
  const weatherService = new WeatherService(weatherServiceConfig)
  const moonPhaseService = new MoonPhaseService(moonPhaseServiceConfig)

  // Create factories and validators
  const componentFactory = new ComponentFactory(weatherService, moonPhaseService)
  const domValidator = new DOMValidator()
  const assetValidator = new AssetValidator()

  // Create app with dependencies
  return new TabletKioskApp(
    DEFAULT_APP_CONFIG,
    domValidator,
    assetValidator,
    componentFactory,
    weatherService,
    errorDisplay
  )
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const errorDisplay = new ErrorDisplay()
    app = createApp()
    await app.initialize()

    ;(globalThis as typeof globalThis & { kioskApp: TabletKioskApp }).kioskApp = app
  } catch (error) {
    console.error('Failed to start application:', error)
    new ErrorDisplay().show('init', error)
  }
})
```

## Testing Benefits

### 1. **DOMValidator Tests**
```typescript
describe('DOMValidator', () => {
  it('should return valid when all elements exist', () => {
    document.body.innerHTML = '<div id="test"></div>'
    const validator = new DOMValidator()
    const result = validator.validate(['test'])
    expect(result.valid).toBe(true)
  })

  it('should list missing elements', () => {
    const validator = new DOMValidator()
    const result = validator.validate(['missing'])
    expect(result.valid).toBe(false)
    expect(result.missing).toEqual(['missing'])
  })
})
```

### 2. **UpdateScheduler Tests**
```typescript
describe('UpdateScheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should call callback immediately and on interval', () => {
    const callback = vi.fn()
    const scheduler = new UpdateScheduler(1000)

    scheduler.start(callback)

    expect(callback).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should stop updates', () => {
    const callback = vi.fn()
    const scheduler = new UpdateScheduler(1000)

    scheduler.start(callback)
    scheduler.stop()

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1) // Only initial call
  })
})
```

### 3. **WeatherUpdateCoordinator Tests**
```typescript
describe('WeatherUpdateCoordinator', () => {
  it('should update all displays with weather data', async () => {
    const mockWeatherService = {
      getProcessedWeatherData: vi.fn().mockResolvedValue(mockWeatherData)
    }
    const mockWeatherDisplay = { updateDisplay: vi.fn() }
    const mockWeatherForecast = { updateForecast: vi.fn() }
    const mockAstronomyTimes = { updateTimes: vi.fn() }
    const mockMoonPhase = { updatePhase: vi.fn() }
    const mockErrorDisplay = { remove: vi.fn(), show: vi.fn() }

    const coordinator = new WeatherUpdateCoordinator(
      mockWeatherService,
      mockWeatherDisplay,
      mockWeatherForecast,
      mockAstronomyTimes,
      mockMoonPhase,
      mockErrorDisplay
    )

    await coordinator.update()

    expect(mockWeatherDisplay.updateDisplay).toHaveBeenCalled()
    expect(mockWeatherForecast.updateForecast).toHaveBeenCalled()
    expect(mockErrorDisplay.remove).toHaveBeenCalledWith('weather-update')
  })
})
```

### 4. **TabletKioskApp Tests**
```typescript
describe('TabletKioskApp', () => {
  it('should initialize when DOM is valid', async () => {
    const mockDomValidator = {
      validate: vi.fn().mockReturnValue({ valid: true, missing: [] })
    }
    const mockComponentFactory = {
      createWeatherDisplay: vi.fn().mockReturnValue({}),
      createWeatherForecast: vi.fn().mockReturnValue({}),
      // ... other creates
    }

    const app = new TabletKioskApp(
      DEFAULT_APP_CONFIG,
      mockDomValidator,
      mockAssetValidator,
      mockComponentFactory,
      mockWeatherService,
      mockErrorDisplay
    )

    await app.initialize()

    expect(mockDomValidator.validate).toHaveBeenCalled()
  })

  it('should throw when DOM is invalid', async () => {
    const mockDomValidator = {
      validate: vi.fn().mockReturnValue({
        valid: false,
        missing: ['test-id']
      })
    }

    const app = new TabletKioskApp(
      DEFAULT_APP_CONFIG,
      mockDomValidator,
      mockAssetValidator,
      mockComponentFactory,
      mockWeatherService,
      mockErrorDisplay
    )

    await expect(app.initialize()).rejects.toThrow('Missing DOM elements')
  })
})
```

## Migration Strategy

1. **Create new files first** (non-breaking):
   - `src/core/DOMValidator.ts`
   - `src/core/AssetValidator.ts`
   - `src/core/UpdateScheduler.ts`
   - `src/core/ComponentFactory.ts`
   - `src/core/WeatherUpdateCoordinator.ts`
   - `src/types/app.types.ts` (for AppConfig)

2. **Write tests for new classes** (TDD approach)

3. **Update `main.ts`** to use new classes

4. **Write integration tests** for the full app

5. **Verify everything works** with the validation commands

## Summary

This refactoring achieves:
- ✅ **Single Responsibility**: Each class has one clear purpose
- ✅ **Dependency Injection**: All dependencies are injected, making mocking trivial
- ✅ **Testability**: Each class can be tested in isolation
- ✅ **Maintainability**: Logic is separated and easier to understand
- ✅ **Flexibility**: Easy to swap implementations or add new features

The tests become much simpler because:
- No need to mock complex internal state
- Each test focuses on one responsibility
- Dependencies are explicit and easy to mock
- No reliance on global state or DOM (except in DOMValidator tests)
