# Lifecycle — Deep Reference

## Two lifecycles in one

Lit components have two interwoven lifecycles:
1. **Native custom element lifecycle** — controlled by the browser
2. **Lit reactive update lifecycle** — controlled by Lit, triggered by property changes

They are distinct. A component can be constructed without ever being connected to the DOM, and
can be disconnected before Lit's update cycle runs at all.

## Full lifecycle order

```
constructor()
  ↓
connectedCallback()          ← native: element added to DOM
  ↓
[property changes enqueued]
  ↓
shouldUpdate(changedProps)   ← return false to abort update
  ↓
willUpdate(changedProps)     ← derive computed state, safe for SSR
  ↓
update(changedProps)         ← calls render(), do not override lightly
  ↓
render()                     ← pure, returns TemplateResult
  ↓
firstUpdated(changedProps)   ← runs once after first render
  ↓
updated(changedProps)        ← runs after every render
  ↓
updateComplete (Promise)     ← resolves when DOM is settled
```

On disconnect:
```
disconnectedCallback()       ← native: element removed from DOM
```

On reconnect, `connectedCallback` fires again. Design accordingly.

## Method reference

### constructor()
- Call `super()` first, always
- Safe to: initialize properties, add host event listeners
- Not safe to: access `this.shadowRoot`, read attributes (not yet available)

```ts
constructor() {
  super();
  this._data = [];
  this.addEventListener('click', this._handleClick);
}
```

### connectedCallback()
- Call `super.connectedCallback()` first, always
- Use for: starting timers, adding global/window listeners, initializing external subscriptions
- Will fire again on reconnect — guard against double-setup if needed

```ts
connectedCallback() {
  super.connectedCallback();
  this._resizeObserver.observe(this);
  window.addEventListener('keydown', this._handleGlobalKey);
}
```

### disconnectedCallback()
- Call `super.disconnectedCallback()` first, always
- Use for: clearing timers, removing global listeners, cancelling subscriptions
- Mirror everything added in `connectedCallback`

```ts
disconnectedCallback() {
  super.disconnectedCallback();
  this._resizeObserver.unobserve(this);
  window.removeEventListener('keydown', this._handleGlobalKey);
}
```

### shouldUpdate(changedProps)
- Return `false` to skip the update cycle entirely
- Use sparingly — prefer `willUpdate` for derived state

```ts
shouldUpdate(changedProps: PropertyValues) {
  return this.isConnected && this.apiUrl !== '';
}
```

### willUpdate(changedProps)
- Runs before render, before DOM update
- **Best place for derived/computed state** — changes here do not trigger extra render cycles
- Safe for SSR (no DOM access)
- Do NOT access `this.shadowRoot` or query DOM here

```ts
willUpdate(changedProps: PropertyValues) {
  if (changedProps.has('items') || changedProps.has('sortKey')) {
    this._sortedItems = [...this.items].sort((a, b) =>
      a[this.sortKey] < b[this.sortKey] ? -1 : 1
    );
  }
  if (changedProps.has('startDate') || changedProps.has('endDate')) {
    this._dayCount = diffDays(this.startDate, this.endDate);
  }
}
```

### update(changedProps)
- Calls `render()` and commits the result to the DOM
- Use when you need to access browser APIs (localStorage, sessionStorage) before render
- If you override: call `super.update(changedProps)` to actually render
- Rarely overridden directly — prefer `willUpdate` or `updated`

```ts
update(changedProps: PropertyValues) {
  if (changedProps.has('theme')) {
    // Need to read from localStorage before render decides which class to apply
    this._resolvedTheme = localStorage.getItem('theme') ?? this.theme;
  }
  super.update(changedProps);
}
```

### firstUpdated(changedProps)
- Runs once after the first render
- Safe to access `this.shadowRoot` and query DOM
- Use for: one-time focus, initializing third-party libraries that need a DOM node, setting up
  observers that need a rendered element

```ts
firstUpdated() {
  this._inputEl.focus();
  this._chart = new ThirdPartyChart(this._canvasEl);
}
```

### updated(changedProps)
- Runs after every render (including first)
- Safe to access rendered DOM
- **Avoid setting reactive properties here** — triggers another update cycle
- Use for: responding to post-render state changes, imperative DOM manipulation, focus management

```ts
updated(changedProps: PropertyValues) {
  if (changedProps.has('open') && this.open) {
    // Focus first focusable item after dialog opens
    this.shadowRoot?.querySelector<HTMLElement>('[autofocus]')?.focus();
  }
}
```

### updateComplete
- A Promise that resolves when the element has finished its current update cycle
- Use in: tests, external imperative code, after programmatic property changes

```ts
// In a test or external script
element.open = true;
await element.updateComplete;
const dialog = element.shadowRoot.querySelector('dialog');
expect(dialog.hasAttribute('open')).to.be.true;
```

Do NOT await `updateComplete` inside lifecycle methods — you're already inside the update cycle.

## Common patterns

### Reacting to a specific property change
```ts
updated(changedProps: PropertyValues) {
  if (changedProps.has('src')) {
    this._loadImage(this.src);
  }
}
```

### Reconciling two interdependent properties
```ts
willUpdate(changedProps: PropertyValues) {
  // If `max` changed and `value` now exceeds it, clamp value
  if (changedProps.has('max') && this.value > this.max) {
    // Safe to set @state here — won't cause extra render
    this._clampedValue = this.max;
  }
}
```

### Performing async work after first render
```ts
async firstUpdated() {
  // Don't block the first paint — kick off work after
  await this.updateComplete;
  this._data = await fetchInitialData();
}
```

## What NOT to do

```ts
// ❌ Setting reactive @property in updated() — causes infinite loop risk
updated(changedProps: PropertyValues) {
  if (changedProps.has('value')) {
    this.value = clamp(this.value); // triggers updated() again!
  }
}

// ✅ Do this in willUpdate() instead
willUpdate(changedProps: PropertyValues) {
  if (changedProps.has('value')) {
    this._clampedValue = clamp(this.value); // @state, safe
  }
}

// ❌ Accessing DOM in willUpdate()
willUpdate() {
  const el = this.shadowRoot.querySelector('input'); // not rendered yet!
}

// ❌ Awaiting updateComplete inside a lifecycle method
async updated() {
  await this.updateComplete; // deadlock risk
}
```
