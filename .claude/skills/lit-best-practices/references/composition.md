# Composition — Deep Reference

## Three composition tools

| Tool | Best for | Adds to prototype? |
|---|---|---|
| Reactive Controllers | Reusable behavior with lifecycle | No |
| `@lit/context` | Sharing data down a tree | No |
| Mixins | Shared API across component classes | Yes |

Prefer controllers over mixins when possible — they don't pollute the prototype and multiple
controllers can be composed freely on one component.

---

## Reactive Controllers

A controller is a plain object that hooks into a host component's lifecycle. It encapsulates
state and behavior that can be reused across many components.

### Minimal controller shape

```ts
import { ReactiveController, ReactiveControllerHost } from 'lit';

export class MyController implements ReactiveController {
  host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this); // register with host
  }

  // Lifecycle hooks — implement only what you need
  hostConnected() {}
  hostDisconnected() {}
  hostUpdate() {}      // called before host renders
  hostUpdated() {}     // called after host renders
}
```

### Real example — polling controller

```ts
export class PollingController implements ReactiveController {
  host: ReactiveControllerHost;
  private _timer: ReturnType<typeof setInterval> | null = null;
  private _callback: () => void;
  interval: number;

  constructor(host: ReactiveControllerHost, callback: () => void, interval = 5000) {
    this.host = host;
    this._callback = callback;
    this.interval = interval;
    host.addController(this);
  }

  hostConnected() {
    this._timer = setInterval(this._callback, this.interval);
  }

  hostDisconnected() {
    if (this._timer !== null) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
}

// Usage in a component
export class MyComponent extends LitElement {
  private _poll = new PollingController(this, () => this._refresh(), 30_000);
}
```

### Real example — media query controller

```ts
export class MediaQueryController implements ReactiveController {
  host: ReactiveControllerHost;
  matches = false;
  private _query: MediaQueryList;
  private _onChange = () => {
    this.matches = this._query.matches;
    this.host.requestUpdate();
  };

  constructor(host: ReactiveControllerHost, query: string) {
    this.host = host;
    this._query = window.matchMedia(query);
    this.matches = this._query.matches;
    host.addController(this);
  }

  hostConnected() {
    this._query.addEventListener('change', this._onChange);
  }

  hostDisconnected() {
    this._query.removeEventListener('change', this._onChange);
  }
}

// Usage
export class MyComponent extends LitElement {
  private _mobile = new MediaQueryController(this, '(max-width: 768px)');

  render() {
    return html`
      ${this._mobile.matches
        ? html`<mobile-nav></mobile-nav>`
        : html`<desktop-nav></desktop-nav>`}
    `;
  }
}
```

### Triggering host updates from a controller

Call `this.host.requestUpdate()` whenever controller state changes and the host should re-render.

---

## @lit/context

Context provides a way to share data down a component tree without passing properties through
every intermediate layer. It uses DOM events internally — no global state, no singletons.

### Setup

```ts
// context.ts — define context tokens
import { createContext } from '@lit/context';

export interface AppConfig {
  apiUrl: string;
  locale: string;
  theme: 'light' | 'dark';
}

export const appConfigContext = createContext<AppConfig>('app-config');
```

### Provider — ancestor component

```ts
import { provide } from '@lit/context';
import { appConfigContext, AppConfig } from './context.js';

@customElement('app-shell')
export class AppShell extends LitElement {
  @provide({ context: appConfigContext })
  config: AppConfig = {
    apiUrl: '/api',
    locale: 'en',
    theme: 'light',
  };
}
```

### Consumer — any descendant

```ts
import { consume } from '@lit/context';
import { appConfigContext, AppConfig } from './context.js';

@customElement('user-profile')
export class UserProfile extends LitElement {
  @consume({ context: appConfigContext, subscribe: true })
  @state()
  private _config!: AppConfig;

  render() {
    return html`<p>API: ${this._config.apiUrl}</p>`;
  }
}
```

`subscribe: true` means the consumer re-renders when the context value changes. Omit for
values that are set once and never change.

### When to use context

- App-wide config (API URL, locale, theme)
- Auth state shared across many components
- Design system tokens or feature flags
- Avoiding prop-drilling more than 2–3 levels deep

### When NOT to use context

- Simple parent→child data: just use `@property`
- Data that only 1–2 components need: pass as properties
- Frequently-changing values in large trees: can cause many re-renders

---

## @lit/task — async data controller

See `SKILL.md` section 7 for the primary reference. Additional patterns:

### Manual trigger (autoRun: false)

```ts
private _submitTask = new Task(this, {
  task: async ([formData]: [FormData]) => {
    const res = await fetch('/api/submit', { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
    return res.json();
  },
  args: () => [this._formData] as [FormData],
  autoRun: false, // don't run until explicitly triggered
});

private _handleSubmit() {
  this._submitTask.run();
}
```

### Chained tasks

```ts
// Task 2 depends on Task 1's result
private _userTask = new Task(this, {
  task: async ([id]) => fetchUser(id),
  args: () => [this.userId],
});

private _postsTask = new Task(this, {
  task: async ([userId]) => {
    if (!userId) return [];
    return fetchPosts(userId);
  },
  // Only runs when userTask has a value
  args: () => [this._userTask.value?.id],
});
```

---

## Mixins

Use mixins when you need to add shared methods or properties to a component's public API — things
that external code will call on the element directly.

```ts
// A mixin that adds disabled behavior to any LitElement
type Constructor<T = LitElement> = new (...args: any[]) => T;

export function DisabledMixin<T extends Constructor>(Base: T) {
  class DisabledElement extends Base {
    @property({ type: Boolean, reflect: true }) disabled = false;

    protected handleDisabledInteraction(e: Event) {
      if (this.disabled) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }
  }
  return DisabledElement;
}

// Usage
@customElement('my-button')
export class MyButton extends DisabledMixin(LitElement) {
  // has `disabled` property and `handleDisabledInteraction` method
}
```

### Base class with multiple mixins

```ts
// Compose mixins cleanly with a typed base
export class MyComponentBase extends
  DisabledMixin(
    FocusMixin(
      LitElement
    )
  ) {}

@customElement('my-input')
export class MyInput extends MyComponentBase {
  // has both disabled and focus behaviors
}
```

### Prefer controllers over mixins when

- The behavior is self-contained and doesn't need to expose a public API
- You need multiple instances of the behavior on one component
- The behavior involves lifecycle management (timers, observers, subscriptions)
