# Styling — Deep Reference

## How Lit styles work

Lit uses the browser's native **Constructable Stylesheets** (where available) to apply styles
efficiently. Styles declared in `static styles` are shared across all instances of a component —
they are not duplicated per instance.

Shadow DOM provides style encapsulation by default:
- Styles inside a component do not leak out
- Global styles do not pierce in (except inherited properties and CSS custom properties)

## static styles — the only place for styles

```ts
import { css } from 'lit';

static styles = css`
  /* All component styles go here */
`;
```

Never use:
- `<style>` tags in `render()` templates — re-parsed on every render
- Inline `style="..."` attributes in templates — use `styleMap()` instead
- External `.css` files imported via `<link>` in shadow DOM — defeats encapsulation

## :host — styling the component itself

```ts
static styles = css`
  /* The custom element itself */
  :host {
    display: block;           /* REQUIRED — custom elements are inline by default */
    box-sizing: border-box;
    contain: content;         /* Performance hint — contents don't affect outside layout */
  }

  /* Respect the hidden attribute */
  :host([hidden]) {
    display: none;
  }

  /* Attribute-driven states */
  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  :host([variant='primary']) {
    --_bg: var(--color-primary, #0057b8);
  }

  :host([variant='danger']) {
    --_bg: var(--color-danger, #c62828);
  }

  /* Focus-visible on the host itself (e.g. for custom focusable elements) */
  :host(:focus-visible) {
    outline: 2px solid var(--focus-ring-color, #0057b8);
    outline-offset: 2px;
  }
`;
```

## CSS custom properties — theming surface

Expose a deliberate theming API via custom properties. Always provide defaults.

```ts
static styles = css`
  :host {
    /* Public theming API — document these in JSDoc */
    --_color: var(--my-card-color, #333);
    --_bg: var(--my-card-bg, #fff);
    --_radius: var(--my-card-radius, 0.5rem);
    --_padding: var(--my-card-padding, 1.5rem);

    display: block;
    color: var(--_color);
    background: var(--_bg);
    border-radius: var(--_radius);
    padding: var(--_padding);
  }
`;
```

Convention: use `--component-name-property` for public custom properties. Use `--_private` (with
underscore) for internal aliases that shouldn't be set from outside.

Consumers style the component like this:
```css
my-card {
  --my-card-bg: #f5f5f5;
  --my-card-radius: 1rem;
}
```

## ::part() — exposing internal elements for styling

Use `part` attributes on internal elements to expose them for external styling:

```ts
render() {
  return html`
    <div part="card">
      <header part="header">${this.title}</header>
      <div part="body"><slot></slot></div>
    </div>
  `;
}
```

Consumers can then style:
```css
my-card::part(header) {
  font-weight: 700;
  background: #f0f0f0;
}
```

Use `part` for structural elements where CSS custom properties are insufficient.

## Slots and ::slotted()

```ts
static styles = css`
  /* Style direct slotted children */
  ::slotted(p) {
    margin-block: 0;
  }

  ::slotted(*) {
    /* Applies to any direct slotted child */
  }

  /* ❌ Cannot style grandchildren of slots — use CSS custom props instead */
  ::slotted(p span) { /* WON'T WORK */ }
`;
```

For styling content deeper than direct slotted children, document CSS custom properties that
consumers can set on their content:
```css
/* Consumer's stylesheet */
my-card p span {
  color: red; /* This works — consumer styles their own content */
}
```

## Shared styles across components

Extract shared styles into a module:

```ts
// src/styles/shared.ts
import { css } from 'lit';

export const resetStyles = css`
  *, *::before, *::after {
    box-sizing: border-box;
  }
`;

export const focusStyles = css`
  :host(:focus-visible) {
    outline: 2px solid var(--focus-ring-color, #0057b8);
    outline-offset: 2px;
  }
`;
```

Use in components:
```ts
import { resetStyles, focusStyles } from '../styles/shared.js';

static styles = [resetStyles, focusStyles, css`
  /* Component-specific styles */
  :host { display: block; }
`];
```

`static styles` accepts a single `CSSResult` or an array of them.

## classMap and styleMap in templates

```ts
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

render() {
  return html`
    <div
      class=${classMap({
        'card': true,
        'card--active': this.active,
        'card--disabled': this.disabled,
      })}
      style=${styleMap({
        '--progress': `${this.progress}%`,
        'transform': this._isDragging ? `translate(${this._x}px, ${this._y}px)` : '',
      })}
    >
      ...
    </div>
  `;
}
```

Use `styleMap` only for truly dynamic values (user-driven, animation state). Static styles always
go in `static styles`.

## Units

- Use `em` for spacing relative to the component's own font size
- Use `rem` for spacing relative to the document root (consistent across components)
- Avoid `px` for font sizes — breaks user font scaling preferences
- Use `px` only for borders, outlines, and other hairline details

## What to avoid

```ts
// ❌ <style> in render() — re-parsed every render
render() {
  return html`
    <style>.foo { color: red }</style>
    <div class="foo">...</div>
  `;
}

// ❌ Inline style string in template
render() {
  return html`<div style="color: ${this.color}">...</div>`;
}

// ✅ Use styleMap for dynamic styles
render() {
  return html`<div style=${styleMap({ color: this.color })}>...</div>`;
}

// ❌ :host-context() — poor and inconsistent browser support
:host-context(.dark-theme) { background: #111; }

// ✅ Use a reflected attribute + :host([attr]) or a CSS custom property instead
:host([theme='dark']) { background: #111; }
```
