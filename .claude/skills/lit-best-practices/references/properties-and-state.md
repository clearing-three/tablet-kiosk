# Reactive Properties and State — Deep Reference

## @property vs @state decision guide

| Scenario | Use |
|---|---|
| Value set by parent via attribute or property | `@property` |
| Value only ever set internally by the component | `@state` |
| Value needs a corresponding HTML attribute | `@property` |
| Value is intermediate computation or UI toggle | `@state` |
| Value should be styleable via CSS `[attr]` selector | `@property({ reflect: true })` |

## @property options

```ts
@property({
  type: String,       // Converter: String, Number, Boolean, Array, Object
  attribute: 'my-attr', // Custom attribute name (default: lowercased property name)
  reflect: false,     // Mirror property back to attribute (default: false)
  hasChanged(newVal, oldVal) {  // Custom change detection
    return newVal !== oldVal;
  },
})
myProp = '';
```

### type converters
- `String` — default, no conversion needed
- `Number` — `parseFloat(attrValue)`
- `Boolean` — presence of attribute = true, absence = false
- `Array` / `Object` — `JSON.parse(attrValue)` — avoid if possible, prefer property binding

### attribute naming
- Default: camelCase property → all-lowercase attribute (`myProp` → `myprop`, not `my-prop`)
- Best practice: always specify `attribute: 'my-prop'` explicitly for multi-word properties to get kebab-case
```ts
// ✅ Explicit attribute name — clear and predictable
@property({ type: Number, attribute: 'poll-interval' })
pollInterval = 5000;

// ❌ Implicit — becomes 'pollinterval' (hard to read)
@property({ type: Number })
pollInterval = 5000;
```

## Reflection — the full picture

Reflection copies the property value back to the DOM attribute whenever the property changes.

**Use reflection for:**
- Boolean flags that CSS needs: `[disabled]`, `[selected]`, `[open]`
- ARIA attributes: `aria-expanded`, `aria-label`
- Values external code queries via `getAttribute()`

**Never reflect:**
- Objects or arrays — serializes to `[object Object]`, large, and triggers layout
- Frequently-changing numbers (e.g., animation progress)
- Private/internal state — use `@state` instead

```ts
// ✅ Good reflection candidates
@property({ type: Boolean, reflect: true }) disabled = false;
@property({ type: Boolean, reflect: true }) open = false;
@property({ type: String, reflect: true }) variant: 'primary' | 'secondary' = 'primary';

// ❌ Bad reflection candidates
@property({ type: Object, reflect: true }) config = {};   // WRONG
@property({ type: Array, reflect: true }) items = [];     // WRONG
```

## @state

- No attribute counterpart — purely internal
- Mark private in TypeScript: `@state() private _count = 0;`
- Prefix with `_` by convention to signal internal ownership
- Never read or set from outside the component

```ts
@state() private _isOpen = false;
@state() private _errorMessage = '';
@state() private _cachedResult: Result | null = null;
```

## Arrays and objects — avoiding stale renders

Lit uses `===` strict equality. Mutations are invisible to Lit.

```ts
// ❌ These will NOT trigger a re-render
this.items.push(newItem);
this.items[0] = updated;
this.config.key = 'value';

// ✅ These WILL trigger a re-render
this.items = [...this.items, newItem];
this.items = this.items.map((item, i) => i === 0 ? updated : item);
this.config = { ...this.config, key: 'value' };
```

## Custom hasChanged

Override change detection when `===` is too strict or too loose:

```ts
// Only re-render if the rounded value changes
@property({
  type: Number,
  hasChanged(newVal: number, oldVal: number) {
    return Math.round(newVal) !== Math.round(oldVal);
  }
})
temperature = 0;
```

## Property initialization

Always initialize with a default value at the declaration site:

```ts
// ✅ Clear default, TypeScript happy
@property({ type: String }) label = '';
@property({ type: Number }) count = 0;
@property({ type: Boolean }) disabled = false;
@property({ type: Array }) items: string[] = [];

// ❌ Avoid — forces non-null assertion everywhere
@property({ type: String }) label!: string;
```

For complex defaults that should not be shared across instances, initialize in the constructor:

```ts
constructor() {
  super();
  this.config = { ...DEFAULT_CONFIG };
}
```
