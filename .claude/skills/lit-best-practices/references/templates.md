# Templates and Directives — Deep Reference

## How Lit templates work

Lit templates are tagged template literals parsed by the `html` tag function. Lit analyzes the
static parts of the template once and only updates the dynamic expressions on re-render. This
means:

- Static HTML structure is never re-parsed
- Only the parts with `${...}` expressions are touched on update
- Never build template strings dynamically — the static/dynamic split is determined at parse time

```ts
// ✅ Correct — static structure, dynamic expressions
render() {
  return html`<div class=${this.cls}>${this.label}</div>`;
}

// ❌ Wrong — dynamic tag names break Lit's parser
render() {
  const tag = this.big ? 'h1' : 'h2';
  return html`<${tag}>${this.label}</${tag}>`; // NEVER DO THIS
}
```

## Binding types

### Text content
```ts
html`<p>${this.message}</p>`
// Renders: string, number, TemplateResult, array of TemplateResults, nothing
```

### Attribute binding (string values)
```ts
html`<div id=${this.id} aria-label=${this.label}></div>`
```

### Property binding (any value, use `.` prefix)
```ts
html`<my-component .config=${this.configObject}></my-component>`
html`<input .value=${this.inputValue}>`  // sets property, not attribute
```

### Boolean attribute binding (use `?` prefix)
```ts
html`<button ?disabled=${this.isDisabled}>Click</button>`
// Adds attribute if truthy, removes it if falsy
```

### Event listener binding (use `@` prefix)
```ts
html`<button @click=${this._handleClick}>Click</button>`
html`<input @input=${this._handleInput} @change=${this._handleChange}>`
```

### Element reference (use `${ref(...)}` directive)
```ts
import { ref, createRef } from 'lit/directives/ref.js';

private _inputRef = createRef<HTMLInputElement>();

render() {
  return html`<input ${ref(this._inputRef)}>`;
}

firstUpdated() {
  this._inputRef.value?.focus();
}
```

Prefer `@query` decorator for static elements. Use `ref()` only when you need the reference
before `firstUpdated` or for dynamically created elements.

---

## Directives

### nothing — for empty/absent renders

```ts
import { nothing } from 'lit';

// ✅ Use nothing for conditional absence
html`${this.showBadge ? html`<span class="badge">${this.count}</span>` : nothing}`

// ❌ Don't use empty string or null — causes attribute/text node to remain
html`${this.showBadge ? html`<span>${this.count}</span>` : ''}`   // leaves empty text node
html`${this.showBadge ? html`<span>${this.count}</span>` : null}` // same issue
```

`nothing` completely removes the node from the DOM.

### repeat() — for keyed lists

```ts
import { repeat } from 'lit/directives/repeat.js';

// ✅ Use repeat() when items have stable identity keys
html`
  <ul>
    ${repeat(
      this.items,
      (item) => item.id,          // key function — must be unique and stable
      (item, index) => html`
        <li>${index + 1}. ${item.name}</li>
      `
    )}
  </ul>
`

// When to use .map() instead:
// - List never reorders
// - List is always fully replaced
// - Items have no stable identity
html`${this.items.map((item) => html`<li>${item}</li>`)}`
```

`repeat()` preserves existing DOM nodes when the list reorders. `.map()` re-renders the full
list on any change. For large lists with frequent reordering, `repeat()` is significantly faster.

### classMap() — conditional classes

```ts
import { classMap } from 'lit/directives/class-map.js';

html`
  <div class=${classMap({
    'button': true,                    // always applied
    'button--primary': this.primary,
    'button--disabled': this.disabled,
    'button--loading': this._loading,
  })}>
    ...
  </div>
`

// ❌ Never string concatenate classes
html`<div class="button ${this.primary ? 'button--primary' : ''}">` // WRONG
```

You can combine a static base class with classMap:
```ts
html`<div class="button ${classMap({ 'button--primary': this.primary })}">`
```

### styleMap() — dynamic inline styles

```ts
import { styleMap } from 'lit/directives/style-map.js';

html`
  <div style=${styleMap({
    '--progress': `${this.progress}%`,
    'opacity': this._visible ? '1' : '0',
    'transform': this._dragging ? `translate(${this._x}px, ${this._y}px)` : '',
  })}>
`

// ❌ Never use template literal strings for dynamic styles
html`<div style="opacity: ${this.opacity}">` // WRONG
```

Use `styleMap` only for truly runtime-dynamic values. Static styles always go in `static styles`.

### cache() — preserve DOM across heavy conditional branches

```ts
import { cache } from 'lit/directives/cache.js';

render() {
  return html`
    ${cache(this._activeTab === 'map'
      ? html`<map-view .data=${this.mapData}></map-view>`
      : html`<table-view .data=${this.tableData}></table-view>`
    )}
  `;
}
```

`cache()` keeps the inactive branch's DOM in memory rather than destroying and recreating it.
Use when the hidden view is expensive to re-initialize (third-party maps, complex forms, etc.).

### ifDefined() — omit attributes when undefined

```ts
import { ifDefined } from 'lit/directives/if-defined.js';

html`<img src=${ifDefined(this.src)} alt=${ifDefined(this.alt)}>`
// If this.src is undefined, the src attribute is omitted entirely
// If this.src is '', the src attribute is set to ''
```

### live() — for inputs with external value control

```ts
import { live } from 'lit/directives/live.js';

html`<input .value=${live(this.value)} @input=${this._handleInput}>`
```

`live()` checks the DOM's current value before deciding whether to update. Use for controlled
inputs where the component manages the value externally. Without `live()`, Lit may skip the
update if the value appears unchanged from the previous render, even if the user has typed
something different.

### until() — simple async rendering

```ts
import { until } from 'lit/directives/until.js';

html`${until(
  this._fetchPromise.then((data) => html`<p>${data.name}</p>`),
  html`<p>Loading...</p>`   // placeholder while pending
)}`
```

`until()` is simple but has no error handling and no state management. For anything beyond a
basic one-shot fetch, use `@lit/task` instead.

### guard() — skip expensive re-renders

```ts
import { guard } from 'lit/directives/guard.js';

html`
  ${guard([this.items], () => html`
    <!-- Expensive computation only runs when items reference changes -->
    ${this.items.map(item => expensiveRender(item))}
  `)}
`
```

`guard()` only re-evaluates its template function when the watched values change (by `===`).
Use sparingly — Lit's own change detection is usually sufficient. Prefer `willUpdate()` for
memoizing computed values.

---

## Template composition patterns

### Sub-render methods

Break large `render()` methods into private helper methods that return `TemplateResult`:

```ts
render() {
  return html`
    ${this._renderHeader()}
    ${this._renderBody()}
    ${this._renderFooter()}
  `;
}

private _renderHeader() {
  return html`<header>...</header>`;
}
```

### Conditional rendering

```ts
// Simple condition
html`${this.isLoggedIn ? html`<user-menu></user-menu>` : html`<login-button></login-button>`}`

// Multiple states — use a method
private _renderContent() {
  if (this._error) return html`<error-state .message=${this._error}></error-state>`;
  if (this._loading) return html`<loading-spinner></loading-spinner>`;
  if (!this._data) return nothing;
  return html`<data-view .data=${this._data}></data-view>`;
}
```

### Rendering lists of objects

```ts
// With repeat() for stable-identity lists
html`
  ${repeat(
    this.notifications,
    (n) => n.id,
    (n) => html`
      <notification-item
        .type=${n.type}
        .message=${n.message}
        @dismiss=${() => this._dismiss(n.id)}
      ></notification-item>
    `
  )}
`
```

## What render() must NOT do

```ts
// ❌ Side effects in render
render() {
  this._count++;              // side effect
  fetch('/api/data');         // async call
  console.log('rendering');   // side effect (at least in production)
  return html`...`;
}

// ❌ DOM reads in render
render() {
  const width = this.offsetWidth; // DOM read — not safe during render
  return html`...`;
}

// ❌ Await in render
async render() {          // render must be synchronous
  const data = await fetch(...);
  return html`...`;
}
```
