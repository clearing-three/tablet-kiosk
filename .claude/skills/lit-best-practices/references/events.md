# Events — Deep Reference

## Three ways to add listeners

### 1. Declarative — in the template (preferred for internal elements)

```ts
render() {
  return html`
    <button @click=${this._handleClick}>Submit</button>
    <input @input=${this._handleInput} @blur=${this._handleBlur}>
  `;
}

private _handleClick(e: MouseEvent) {
  // `this` is automatically the component instance — no .bind() needed
}
```

Declarative listeners are automatically:
- Bound to `this`
- Added when the element renders, removed when it leaves the template
- Re-used across renders (not re-added on every update)

### 2. Imperative on the host — in the constructor (for host element events)

```ts
constructor() {
  super();
  // Added once, no cleanup needed — GC handles it when element is removed
  this.addEventListener('keydown', this._handleKeyDown);
  this.addEventListener('focus', this._handleFocus, { capture: true });
}

// Arrow function field — stable reference, bound to `this`
private _handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') this._close();
};
```

Why in the constructor and not `connectedCallback`?
- Host listeners don't need cleanup — the browser GCs them with the element
- Constructor fires exactly once — no risk of duplicate listeners on reconnect

### 3. Imperative on global/external nodes — in connected/disconnectedCallback

```ts
// Arrow function field ensures stable reference for removeEventListener
private _handleResize = () => {
  this._width = this.getBoundingClientRect().width;
  this.requestUpdate();
};

connectedCallback() {
  super.connectedCallback();
  window.addEventListener('resize', this._handleResize);
  document.addEventListener('click', this._handleOutsideClick);
}

disconnectedCallback() {
  super.disconnectedCallback();
  window.removeEventListener('resize', this._handleResize);
  document.removeEventListener('click', this._handleOutsideClick);
}
```

**Critical:** always use an arrow function field (not a method) for global listeners, so the
reference is stable across `add` and `remove` calls.

```ts
// ❌ Method reference — different object each time, removeEventListener fails silently
window.addEventListener('resize', this._handleResize.bind(this));
window.removeEventListener('resize', this._handleResize.bind(this)); // WRONG

// ✅ Arrow function field — same reference
private _handleResize = () => { ... };
window.addEventListener('resize', this._handleResize);
window.removeEventListener('resize', this._handleResize); // CORRECT
```

## Dispatching custom events

### Canonical pattern

```ts
this.dispatchEvent(new CustomEvent('value-changed', {
  detail: { value: this._value, previousValue: this._previousValue },
  bubbles: true,    // event travels up the DOM tree
  composed: true,   // event crosses shadow DOM boundaries
}));
```

**Always use `bubbles: true, composed: true`** for events intended to be heard by ancestors
outside the component's shadow root. Without `composed: true`, the event stops at the shadow root
boundary and parent components in the light DOM will never see it.

### When to omit bubbles/composed

Only omit if the event is strictly internal — meant only for the component itself or a direct
parent that has a reference to the element. This is rare.

### Naming convention

Always `kebab-case`. Follow the pattern `noun-verb` or `noun-state`:

```
value-changed       ✅
item-selected       ✅
dialog-closed       ✅
search-submitted    ✅
valueChanged        ❌ camelCase
onChange            ❌ React convention, not web component convention
```

### TypeScript — typing custom events

Declare events on the element's interface for type-safe listeners:

```ts
// In the component file
export interface MyInputChangeEvent extends CustomEvent {
  detail: { value: string };
}

// Extend the global interface for type-safe addEventListener
declare global {
  interface HTMLElementEventMap {
    'my-input-change': MyInputChangeEvent;
  }
}
```

Consumers get typed event detail:
```ts
myInput.addEventListener('my-input-change', (e) => {
  console.log(e.detail.value); // string — typed correctly
});
```

### Document events in JSDoc

```ts
/**
 * @fires {CustomEvent<{value: string}>} value-changed - Fired when the user changes the value.
 * @fires {CustomEvent<{error: Error}>} fetch-error - Fired when the API request fails.
 */
@customElement('my-input')
export class MyInput extends LitElement { ... }
```

## Event delegation

For lists with many items, add one listener on a container rather than per-item:

```ts
render() {
  return html`
    <ul @click=${this._handleListClick}>
      ${repeat(this.items, (item) => item.id, (item) => html`
        <li data-id=${item.id}>${item.label}</li>
      `)}
    </ul>
  `;
}

private _handleListClick(e: MouseEvent) {
  const li = (e.target as Element).closest('li');
  if (!li) return;
  const id = li.dataset.id;
  this._selectItem(id);
}
```

Only works for events that bubble. `focus` and `blur` do not bubble — use `focusin`/`focusout`
instead for delegation.

## Shadow DOM and event retargeting

When a bubbling event crosses a shadow root boundary, the browser **retargets** it — `event.target`
appears as the host element to outside listeners, not the internal element that originated it.

```ts
// Inside component: event.target is the internal <button>
// Outside component: event.target appears as <my-component>
```

This is intentional encapsulation. If consumers need to know which internal element fired the
event, include that information in the `detail` of a custom event.

## Common patterns

### Forwarding a native event as a custom event

```ts
private _handleNativeInput(e: InputEvent) {
  e.stopPropagation(); // prevent native event from leaking out
  this.dispatchEvent(new CustomEvent('my-input-changed', {
    detail: { value: (e.target as HTMLInputElement).value },
    bubbles: true,
    composed: true,
  }));
}
```

### One-time event listener

```ts
this.addEventListener('animationend', this._handleAnimationEnd, { once: true });
```

### Passive listeners for scroll/touch performance

```ts
window.addEventListener('scroll', this._handleScroll, { passive: true });
```

### Listening for slotted content changes

```ts
firstUpdated() {
  this.shadowRoot
    ?.querySelector('slot')
    ?.addEventListener('slotchange', this._handleSlotChange);
}

private _handleSlotChange = (e: Event) => {
  const slot = e.target as HTMLSlotElement;
  const assigned = slot.assignedElements();
  // react to new slotted content
};
```
