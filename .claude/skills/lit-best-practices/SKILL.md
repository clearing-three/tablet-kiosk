---
name: lit-best-practices
description: >
  Best practices for building web components with the Lit framework (LitElement). Use this skill
  whenever you are writing, reviewing, or refactoring Lit components — including component structure,
  reactive properties, internal state, styling, events, lifecycle, async data, composition patterns,
  accessibility, and performance. Trigger this skill whenever the user mentions Lit, LitElement,
  web components with Lit, or asks you to write or review a custom element built on Lit. Also
  trigger when the user references @property, @state, lit-html, or the html`` template tag.
---

# Lit Best Practices Skill

Use this skill whenever writing or reviewing Lit components. Follow all rules below. When in doubt,
prefer explicitness, declarative patterns, and Shadow DOM encapsulation.

For deeper reference on any topic, read the appropriate file in `references/`:
- `references/properties-and-state.md` — reactive properties, @property vs @state, reflection, arrays/objects
- `references/lifecycle.md` — willUpdate, update, updated, firstUpdated, updateComplete
- `references/styling.md` — static styles, :host, CSS custom properties, classMap/styleMap
- `references/events.md` — declarative vs imperative listeners, custom events, cleanup
- `references/composition.md` — reactive controllers, @lit/context, mixins, @lit/task
- `references/templates.md` — directives: repeat, cache, classMap, nothing, until

---

## 1. Component Structure

**Always follow this canonical layout order:**

```ts
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';

@customElement('my-component')
export class MyComponent extends LitElement {
  // 1. static styles
  static styles = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
  `;

  // 2. Public reactive properties (@property)
  @property({ type: String }) value = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  // 3. Private/internal reactive state (@state)
  @state() private _loading = false;

  // 4. DOM queries (@query / @queryAll / @queryAssignedElements)
  @query('input') private _input!: HTMLInputElement;
  @queryAll('.item') private _items!: NodeListOf<HTMLElement>;
  @queryAssignedElements({ slot: 'header' }) private _headerSlots!: HTMLElement[];

  // 5. Reactive controllers
  private _task = new Task(this, ...);

  // 6. Lifecycle methods (constructor, connectedCallback, etc.)
  // 7. willUpdate / update / updated / firstUpdated
  // 8. render()
  // 9. Private helper methods
}
```

**Rules:**
- Always use `@customElement` decorator (not bare `customElements.define` unless non-TS)
- Always set `:host { display: block }` (or `inline-block`/`flex`). Custom elements are `inline` by default — a common bug
- Always add `:host([hidden]) { display: none }` to respect the `hidden` attribute
- Use TypeScript with decorators. Prefer decorator syntax over `static properties = {}`
- Use `@query` / `@queryAll` only when you need imperative DOM access (focus, measurements, third-party lib integration) — not for rendering

---

## 2. Reactive Properties and State

**@property** = public API, accepts attributes, can reflect to attributes
**@state** = private internal state, no attribute, no reflection

```ts
// ✅ Public input from parent
@property({ type: Number }) count = 0;

// ✅ Internal state — not part of public API
@state() private _open = false;

// ✅ Reflect booleans/enums for CSS hooks and a11y
@property({ type: Boolean, reflect: true }) selected = false;

// ❌ Don't reflect complex objects/arrays — performance cost, no benefit
@property({ type: Object, reflect: true }) data = {};  // WRONG
```

**Mutation rules:**
- A component should NOT mutate its own `@property` values, except in response to user input
- Dispatch a custom event upward so the parent can update the property
- A component always owns its `@state` values

**Arrays and objects:**
- Lit uses strict equality (`===`) for change detection
- Never `.push()` or mutate in place — always reassign: `this.items = [...this.items, newItem]`
- For objects: `this.config = { ...this.config, key: newVal }`

**Reflection — use sparingly:**
- Reflect only when CSS or external code needs the attribute (e.g., `[disabled]`, `[selected]`, `[aria-*]`)
- Never reflect large objects or arrays

---

## 3. Templates and Directives

**render() must be a pure function** — no side effects, no DOM reads, no async calls.

```ts
render() {
  return html`
    <div class=${classMap({ active: this._active, disabled: this.disabled })}>
      ${this._loading ? html`<span>Loading...</span>` : nothing}
      ${repeat(this.items, (item) => item.id, (item) => html`
        <my-item .data=${item}></my-item>
      `)}
    </div>
  `;
}
```

**Directive rules:**
- Use `nothing` (not `''` or `null`) for conditional empty renders: `${condition ? html`...` : nothing}`
- Use `repeat()` for lists when items have stable identity (prevents full re-render on reorder)
- Use `classMap()` for conditional classes — never string concatenation
- Use `styleMap()` for dynamic inline styles — never template-literal style strings
- Use `cache()` to preserve DOM between heavy conditional branches
- Use `until()` only for simple async rendering; prefer `@lit/task` for anything stateful

**Property vs attribute bindings:**
```html
<!-- Attribute (string only): -->
<my-el label="hello"></my-el>

<!-- Property (any type, use . prefix): -->
<my-el .data=${this.complexObject}></my-el>

<!-- Boolean attribute (use ? prefix): -->
<my-el ?disabled=${this.isDisabled}></my-el>

<!-- Event listener (use @ prefix): -->
<my-el @click=${this._handleClick}></my-el>
```

---

## 4. Styles

```ts
static styles = css`
  :host {
    display: block;
    /* Expose theming via CSS custom properties */
    color: var(--my-component-color, #333);
    background: var(--my-component-bg, white);
  }

  /* Use :host([attr]) for attribute-driven styling */
  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
  }

  /* Style slotted direct children */
  ::slotted(p) {
    margin: 0;
  }

  /* Cannot style grandchildren of slots — use CSS custom props instead */
`;
```

**Rules:**
- All styles go in `static styles` — never inline style attributes in templates (except via `styleMap`)
- Use CSS custom properties to expose theming surface to consumers
- Do NOT use `::slotted()` to style grandchildren — it won't work; use CSS custom properties instead
- Avoid `:host-context()` — poor browser support
- Prefer `em`/`rem` units to keep components responsive to document font scaling
- For shared styles across components: use a shared `css` tagged template exported from a styles module

---

## 5. Events

**Declarative listeners in templates** (preferred for component-internal elements):
```ts
render() {
  return html`<button @click=${this._handleClick}>Click</button>`;
}
// Automatically bound to `this` — no manual bind needed
private _handleClick(e: Event) { ... }
```

**Imperative listeners on host** (add in constructor, no cleanup needed):
```ts
constructor() {
  super();
  this.addEventListener('keydown', this._handleKeyDown);
}
```

**Global listeners** (add/remove in connected/disconnected):
```ts
connectedCallback() {
  super.connectedCallback();
  window.addEventListener('resize', this._handleResize);
}
disconnectedCallback() {
  super.disconnectedCallback();
  window.removeEventListener('resize', this._handleResize);
}
// Use arrow function or bind once in constructor to keep reference stable
private _handleResize = () => { ... };
```

**Dispatching custom events:**
```ts
// ✅ Canonical pattern
this.dispatchEvent(new CustomEvent('value-changed', {
  detail: { value: this._value },
  bubbles: true,
  composed: true,  // crosses shadow DOM boundary
}));
```

**Rules:**
- Always `bubbles: true, composed: true` for events meant to be heard by ancestors outside shadow DOM
- Name custom events in `kebab-case`
- Document events in JSDoc on the class
- Never use `@click` on the host element in a template (use `addEventListener` in constructor)

---

## 6. Lifecycle

**Decision tree for where to put logic:**

| Need | Use |
|---|---|
| Compute derived state from properties | `willUpdate(changedProps)` |
| Access browser APIs (localStorage, DOM) before render | `update(changedProps)` |
| React to rendered DOM after update | `updated(changedProps)` |
| Run once after first render | `firstUpdated()` |
| Wait for DOM to settle after update | `await this.updateComplete` |

```ts
willUpdate(changedProps: PropertyValues) {
  // ✅ Derive computed values — safe for SSR
  if (changedProps.has('items')) {
    this._sortedItems = [...this.items].sort(...);
  }
}

firstUpdated() {
  // ✅ One-time setup needing rendered DOM
  this._input.focus();
}

updated(changedProps: PropertyValues) {
  // ✅ React to changes after render
  // ⚠️ Avoid setting reactive props here — causes extra render cycle
  if (changedProps.has('open') && this.open) {
    this._focusFirstItem();
  }
}
```

**Rules:**
- Always call `super.connectedCallback()` and `super.disconnectedCallback()`
- Never set reactive properties in `updated()` unless unavoidable — triggers another render
- Don't read DOM in `willUpdate()` — DOM may not be ready
- Use `await this.updateComplete` in tests and imperative code, not in lifecycle methods

---

## 7. Async Data — Use @lit/task

For any network fetch or async operation, use `@lit/task` — not raw promises stored in `@state`.

```ts
import { Task } from '@lit/task';

private _userTask = new Task(this, {
  task: async ([userId]) => {
    const res = await fetch(`/api/users/${userId}`);
    if (!res.ok) throw new Error('Failed to load');
    return res.json();
  },
  args: () => [this.userId],  // re-runs when userId changes
});

render() {
  return this._userTask.render({
    initial: () => html``,
    pending: () => html`<my-spinner></my-spinner>`,
    complete: (user) => html`<p>${user.name}</p>`,
    error: (e) => html`<p class="error">${e.message}</p>`,
  });
}
```

**Dispatching events on task completion:**

Do NOT dispatch events from `updated()` by inspecting task status — the logic is fragile. Instead, dispatch from inside the task function itself, after the await resolves:

```ts
private _dataTask = new Task(this, {
  task: async ([id]) => {
    const res = await fetch(`/api/data/${id}`);
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    // ✅ Dispatch here — you have the data, you're already in async context
    this.dispatchEvent(new CustomEvent('data-loaded', {
      detail: { data },
      bubbles: true,
      composed: true,
    }));
    return data;
  },
  args: () => [this.itemId],
});
```

For errors, dispatch from the `error` branch of `task.render()`, not from `updated()`.

**Rules:**
- Always handle `initial`, `pending`, `complete`, and `error` states
- Use `autoRun: false` + `task.run()` for user-triggered actions (form submit, button click)
- Don't await inside `render()` — templates render synchronously
- Always import `TaskStatus` — never compare `task.status` to magic numbers

---

## 8. Composition Patterns

**Reactive Controllers** — preferred for reusable behavior with lifecycle:
```ts
class ResizeController {
  host: ReactiveControllerHost;
  size = { width: 0, height: 0 };
  private _observer = new ResizeObserver((entries) => {
    this.size = { width: entries[0].contentRect.width, height: entries[0].contentRect.height };
    this.host.requestUpdate();
  });
  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }
  hostConnected() { this._observer.observe(this.host as Element); }
  hostDisconnected() { this._observer.disconnect(); }
}
```

**@lit/context** — for sharing data down a component tree without prop drilling:
- Use `@provide` on an ancestor, `@consume` on descendants
- Prefer context over global state for component-tree-scoped data

**Mixins** — for sharing a narrow API across many component classes. Use sparingly. Prefer controllers when possible (controllers don't pollute the prototype).

---

## 9. Accessibility

- Use semantic HTML inside shadow DOM — `<button>`, `<input>`, `<nav>`, not `<div>` everywhere
- Reflect ARIA attributes that need to be visible externally: `@property({ reflect: true }) ariaLabel = ''`
- Use `ElementInternals` (via `static formAssociated = true`) for form-participating components
- Manage focus explicitly: on open/close of dialogs/menus, call `.focus()` after `updateComplete`
- Test with keyboard navigation and a screen reader

---

## 10. Performance

- Prefer `repeat()` over `.map()` for lists that may reorder or partially update
- Prefer `cache()` to preserve DOM for heavy views toggled frequently
- Don't create new objects/arrays in `render()` — they break property binding equality checks
- Use `willUpdate()` to memoize derived values rather than recomputing in `render()`
- Prefer `@lit-labs/observers` (ResizeObserver, MutationObserver controllers) over manual observer wiring

---

## 11. Slots and Content Projection

Use `<slot>` to allow consumers to pass content into your component:

```ts
render() {
  return html`
    <div class="header">
      <slot name="header"></slot>
    </div>
    <div class="body">
      <slot></slot>  <!-- unnamed/default slot -->
    </div>
  `;
}

// Query slotted elements when needed
@queryAssignedElements({ slot: 'header' })
private _headerElements!: HTMLElement[];
```

**Rules:**
- Use named slots for specific content areas, unnamed slot for general content
- Cannot style grandchildren of slots with `::slotted()` — use CSS custom properties instead
- Use `@queryAssignedElements` to react to slotted content (e.g., for layout calculations)
- Slots are part of the public API — document them in JSDoc

---

## 12. Manual Updates

**You almost never need to call `requestUpdate()` manually.** Lit automatically tracks reactive properties and triggers updates.

Only call `requestUpdate()` when:
- Mutating a deeply nested property that Lit can't detect (better: reassign the root object)
- Reacting to external state changes not tracked by `@property` or `@state` (better: use reactive controllers)
- Integrating with non-Lit libraries that mutate the DOM directly

If you find yourself calling `requestUpdate()` frequently, you're likely fighting the framework — refactor to use reactive properties instead.
