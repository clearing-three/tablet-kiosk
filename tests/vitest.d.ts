import 'vitest'

declare module 'vitest' {
  interface Matchers<R, T> {
    toBeWithinRange: (floor: number, ceiling: number) => R
  }
}
