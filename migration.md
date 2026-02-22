# Migration Plan: Jest → Vitest

## Motivation

The project currently uses Jest with `ts-jest` (ESM preset) to transpile TypeScript on-demand
for tests. Vite is already used for the build step. Migrating to Vitest:

- Aligns the test transform pipeline with the build pipeline (both use Vite/esbuild)
- Eliminates `ts-jest` and its separate `tsconfig.test.json`
- Gives native `import.meta.env` support — removes the need for `tests/testEnvironment.ts`
- Improves test speed via esbuild transforms and parallel workers
- Reduces config surface area

---

## Steps

### 1. Install / remove packages

Remove:
```
jest
ts-jest
@types/jest
jest-environment-jsdom
```

Add:
```
vitest
@vitest/coverage-v8
jsdom                  # vitest uses jsdom directly, not jest-environment-jsdom
```

---

### 2. Create `vitest.config.ts`

Replace `jest.config.js` with a `vitest.config.ts` that extends the existing Vite config:

```ts
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,               // makes describe/it/expect/vi available without imports
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
      testTimeout: 10000,
      clearMocks: true,
      restoreMocks: true,
      coverage: {
        provider: 'v8',
        thresholds: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        exclude: [
          '**/*.d.ts',
          'src/main.ts',
          'src/config/environment.ts',
          'src/types/app.types.ts',
        ],
      },
    },
  })
);
```

Key differences from `jest.config.js`:
- No `moduleNameMapper` needed for `@/` — inherited from `viteConfig` resolve aliases
- No `transform` config — Vitest uses Vite's pipeline automatically
- The environment mock alias (`../../src/config/environment` → mock) moves to `vi.mock()` calls
  or a `__mocks__` directory convention (see step 6)

---

### 3. Delete `jest.config.js`

No longer needed.

---

### 4. Delete `tests/testEnvironment.ts`

This file exists solely to mock `import.meta.env` for Jest. Vitest natively understands
`import.meta.env` and reads from the Vite config's `env` settings. Delete the file and remove
any imports of it from test files.

Set test env vars in `vitest.config.ts` under `test.env` or keep setting them on `process.env`
in `tests/setup.ts` — both work.

---

### 5. Delete `tsconfig.test.json`

This file exists because ts-jest needed `esModuleInterop: true` for CJS interop. Vitest doesn't
use tsc to transform, so the separate tsconfig is unnecessary. Verify nothing else references it
before deleting.

---

### 6. Handle the environment module mock

`jest.config.js` uses `moduleNameMapper` to redirect `src/config/environment` imports to the
test mock. In Vitest, this is done with an explicit `vi.mock()` call or by placing a mock in a
`__mocks__` directory adjacent to the source file.

Options (pick one):
- **Preferred**: Add `vi.mock('@/config/environment', () => import('./__mocks__/environment'))` to
  `tests/setup.ts` so it applies globally without touching individual test files.
- **Alternative**: Move `tests/__mocks__/environment.ts` to `src/config/__mocks__/environment.ts`
  and call `vi.mock('@/config/environment')` in setup — Vitest will auto-resolve the `__mocks__`
  sibling.

---

### 7. Replace `jest.*` globals with `vi.*`

Vitest's `vi` object is the equivalent of Jest's `jest` object. With `globals: true` in the
config, `vi` is available without imports (same as `jest` was).

Find and replace across `tests/`:

| Jest | Vitest |
|------|--------|
| `jest.fn()` | `vi.fn()` |
| `jest.spyOn()` | `vi.spyOn()` |
| `jest.mock()` | `vi.mock()` |
| `jest.clearAllMocks()` | `vi.clearAllMocks()` |
| `jest.restoreAllMocks()` | `vi.restoreAllMocks()` |
| `jest.resetAllMocks()` | `vi.resetAllMocks()` |
| `jest.useFakeTimers()` | `vi.useFakeTimers()` |
| `jest.useRealTimers()` | `vi.useRealTimers()` |
| `jest.runAllTimers()` | `vi.runAllTimers()` |

Affected files:
- `tests/__mocks__/setup.ts` — `jest.clearAllMocks()` call
- `tests/__mocks__/api/openweathermap.ts` — `jest.fn()` calls
- `tests/__mocks__/dom/browser-apis.ts` — `jest.fn()` calls
- `tests/__mocks__/libraries/moon-phase.ts` — `jest.fn()` calls
- `tests/setup.ts` — custom matcher registration, any jest globals
- All `tests/**/*.test.ts` files — any direct `jest.*` calls

---

### 8. Update custom matcher

The `toBeWithinRange` matcher in `tests/setup.ts` uses `expect.extend()` — this API is identical
in Vitest, so no change needed to the matcher logic. However, the TypeScript type augmentation
target changes:

```ts
// Jest (before)
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}

// Vitest (after)
import type { Assertion } from 'vitest';
declare module 'vitest' {
  interface Assertion<T = unknown> {
    toBeWithinRange(floor: number, ceiling: number): T;
  }
}
```

---

### 9. Update `package.json` scripts

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

Note: `vitest` (no `run`) is the interactive watch mode; `vitest run` is the CI/single-pass mode.

---

### 10. Update the validation command in `CLAUDE.md`

No change needed — `npm test` still calls the test suite. The underlying runner changes
transparently.

---

## Validation

After completing all steps, run the full validation chain:

```bash
npm run format && npm run lint:fix && npm run lint && npm test && npm run build
```

All 15 test files should pass with coverage thresholds met. If any test fails:
- `vi is not defined` — check `globals: true` is set in `vitest.config.ts`
- `import.meta.env` undefined — verify `testEnvironment.ts` is deleted and env vars are set in
  `vitest.config.ts` or `setup.ts`
- Module not found for `@/` paths — verify `vitest.config.ts` merges `viteConfig` correctly
- Environment mock not applied — verify the `vi.mock()` call in `setup.ts`

---

## Files changed summary

| File | Action |
|------|--------|
| `jest.config.js` | Delete |
| `tsconfig.test.json` | Delete |
| `tests/testEnvironment.ts` | Delete |
| `vitest.config.ts` | Create |
| `tests/setup.ts` | Update (custom matcher types, vi.mock for environment) |
| `tests/__mocks__/setup.ts` | Update (jest.* → vi.*) |
| `tests/__mocks__/api/openweathermap.ts` | Update (jest.fn → vi.fn) |
| `tests/__mocks__/dom/browser-apis.ts` | Update (jest.fn → vi.fn) |
| `tests/__mocks__/libraries/moon-phase.ts` | Update (jest.fn → vi.fn) |
| `tests/**/*.test.ts` | Update any direct jest.* usage |
| `tests/jest.d.ts` | Delete (superseded by declare module in setup.ts) |
| `package.json` | Update deps and scripts |
| `tsconfig.json` | Add `"vitest/globals"` and `"node"` to types; add `"tests"` to include |

---

## Implementation notes

Completed on 2026-02-22. All 389 tests pass across 15 test files. Full validation chain
(`format → lint → test → build`) passes cleanly.

### What diverged from the plan

**`vitest.config.ts` was written standalone rather than using `mergeConfig`**

The vite config sets `root: 'src'`, which would have caused Vitest to resolve test paths
relative to `src/` rather than the project root. Standalone config with the `@/` alias
manually copied avoids this.

**`tsconfig.test.json` was deleted but `tsconfig.json` needed two additions**

Adding `"vitest/globals"` to the `types` array implicitly excluded `@types/node`, which had
previously been auto-resolved. Adding `"node"` alongside restores `global`, `NodeJS.Timeout`,
etc. Also added `"tests"` to `include` so `tsc --noEmit` covers test files.

**`tests/jest.d.ts` was an undocumented file that also needed deletion**

It contained the old Jest `Matchers<R>` augmentation for `toBeWithinRange`. Superseded by the
`declare module 'vitest'` block added to `tests/setup.ts`. Also note: Vitest's `Assertion`
interface uses `T = any` as the default type parameter — using `T = unknown` causes TS2428.

### Non-obvious issues encountered during implementation

**1. Multi-line `jest.fn()` calls missed by sed**

The bulk sed replacement (`jest\.fn(` → `vi.fn(`) operates line-by-line. Two cases had the
object and method call split across lines:

```ts
// was not replaced:
const cb = jest
  .fn()
  .mockRejectedValue(...)
```

Required manual fixes in `TimeService.test.ts` and `TimeDisplay.test.ts`.

**2. `vi.spyOn(global, 'Date').mockImplementation(() => mockDate)` does not work**

Jest was permissive about replacing the `Date` constructor via `spyOn`. Vitest is not —
`new Date()` requires a constructable function, so passing `() => mockDate` throws at runtime.

Fixed in `formatters.test.ts` by switching to `vi.useFakeTimers()` + `vi.setSystemTime()`,
which is the correct idiomatic approach for controlling `new Date()` output.

**3. `.mockImplementation()` with no arguments fails TypeScript**

Jest accepted `mockImplementation()` with no arguments (returns undefined). Vitest's TypeScript
types require at least one argument. All occurrences were replaced with `.mockImplementation(() => {})`.
