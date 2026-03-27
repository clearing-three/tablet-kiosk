/**
 * Browser API mocks for testing
 *
 * Provides mock implementations of browser APIs and DOM methods
 * used by the tablet kiosk application.
 */

import process from 'node:process'

/**
 * Mock Image constructor for weather icon testing
 */
export class MockImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src: string = ''
  alt: string = ''
  width: number = 0
  height: number = 0

  constructor() {
    // Simulate successful image loading by default
    setTimeout(() => {
      if (this.onload) {
        this.onload()
      }
    }, 0)
  }

  // Simulate image load success
  simulateLoad() {
    if (this.onload) {
      this.onload()
    }
  }

  // Simulate image load error
  simulateError() {
    if (this.onerror) {
      this.onerror()
    }
  }
}

/**
 * Mock SVG object element for weather icons
 */
export class MockSVGObjectElement {
  data: string = ''
  type: string = 'image/svg+xml'
  contentDocument: Document | null = null
  onload: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor() {
    // Create mock contentDocument
    this.contentDocument = {
      documentElement: {
        setAttribute: vi.fn(),
        getAttribute: vi.fn(() => '100'),
        style: {
          width: '100%',
          height: '100%',
        },
      },
    } as any

    // Simulate successful load
    setTimeout(() => {
      if (this.onload) {
        this.onload()
      }
    }, 0)
  }

  simulateLoad() {
    if (this.onload) {
      this.onload()
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror()
    }
  }
}

/**
 * Mock timer functions for interval management
 */
const timerState = {
  intervals: new Map<number, NodeJS.Timeout>(),
  timeouts: new Map<number, NodeJS.Timeout>(),
  nextId: 1,
}

export class TimerMock {
  private static originalSetInterval = setInterval
  private static originalClearInterval = clearInterval
  private static originalSetTimeout = setTimeout
  private static originalClearTimeout = clearTimeout

  static mockSetInterval(callback: () => void, delay: number = 0): number {
    const id = timerState.nextId++
    // Execute immediately in tests for faster execution
    const timer = TimerMock.originalSetInterval(callback, Math.min(delay, 10))
    timerState.intervals.set(id, timer)
    return id
  }

  static mockClearInterval(id: number): void {
    const timer = timerState.intervals.get(id)
    if (timer) {
      TimerMock.originalClearInterval(timer)
      timerState.intervals.delete(id)
    }
  }

  static mockSetTimeout(callback: () => void, delay: number = 0): number {
    const id = timerState.nextId++
    const timer = TimerMock.originalSetTimeout(callback, Math.min(delay, 10))
    timerState.timeouts.set(id, timer)
    return id
  }

  static mockClearTimeout(id: number): void {
    const timer = timerState.timeouts.get(id)
    if (timer) {
      TimerMock.originalClearTimeout(timer)
      timerState.timeouts.delete(id)
    }
  }

  static clearAll(): void {
    timerState.intervals.forEach(timer =>
      TimerMock.originalClearInterval(timer),
    )
    timerState.timeouts.forEach(timer => TimerMock.originalClearTimeout(timer))
    timerState.intervals.clear()
    timerState.timeouts.clear()
  }

  static getActiveIntervals(): number {
    return timerState.intervals.size
  }

  static getActiveTimeouts(): number {
    return timerState.timeouts.size
  }
}

/**
 * Mock local storage for configuration persistence
 */
export class LocalStorageMock {
  private storage: Map<string, string> = new Map()

  getItem(key: string): string | null {
    return this.storage.get(key) || null
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value)
  }

  removeItem(key: string): void {
    this.storage.delete(key)
  }

  clear(): void {
    this.storage.clear()
  }

  get length(): number {
    return this.storage.size
  }

  key(index: number): string | null {
    const keys = Array.from(this.storage.keys())
    return keys[index] || null
  }
}

/**
 * Mock console for testing console output
 */
export class ConsoleMock {
  log = vi.fn()
  error = vi.fn()
  warn = vi.fn()
  info = vi.fn()
  debug = vi.fn()

  clear(): void {
    this.log.mockClear()
    this.error.mockClear()
    this.warn.mockClear()
    this.info.mockClear()
    this.debug.mockClear()
  }
}

/**
 * Mock geolocation API
 */
export class GeolocationMock {
  getCurrentPosition = vi.fn()
  watchPosition = vi.fn()
  clearWatch = vi.fn()

  mockSuccess(position: GeolocationPosition) {
    this.getCurrentPosition.mockImplementationOnce((success) => {
      setTimeout(success, 0, position)
    })
  }

  mockError(error: GeolocationPositionError) {
    this.getCurrentPosition.mockImplementationOnce(
      (_success, errorCallback) => {
        setTimeout(() => errorCallback && errorCallback(error), 0)
      },
    )
  }
}

/**
 * Mock ResizeObserver for responsive behavior testing
 */
export class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()

  constructor(callback: ResizeObserverCallback) {
    // Store callback for potential triggering in tests
    ;(this as any).callback = callback
  }

  // Trigger resize event in tests
  triggerResize(entries: ResizeObserverEntry[]) {
    ;(this as any).callback(entries, this)
  }
}

/**
 * Mock IntersectionObserver for visibility testing
 */
export class IntersectionObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()

  constructor(callback: IntersectionObserverCallback) {
    ;(this as any).callback = callback
  }

  triggerIntersection(entries: IntersectionObserverEntry[]) {
    ;(this as any).callback(entries, this)
  }
}

/**
 * Browser API mock setup utility
 */
export class BrowserApiMock {
  private static originalApis: Map<string, unknown> = new Map()

  static setup() {
    // Mock Image
    this.originalApis.set('Image', globalThis.Image)
    globalThis.Image = MockImage as any

    // Mock SVG object element
    this.originalApis.set('HTMLObjectElement', globalThis.HTMLObjectElement)
    globalThis.HTMLObjectElement = MockSVGObjectElement as any

    // Mock timers
    this.originalApis.set('setInterval', globalThis.setInterval)
    this.originalApis.set('clearInterval', globalThis.clearInterval)
    this.originalApis.set('setTimeout', globalThis.setTimeout)
    this.originalApis.set('clearTimeout', globalThis.clearTimeout)

    globalThis.setInterval = vi.fn(TimerMock.mockSetInterval) as any
    globalThis.clearInterval = vi.fn(TimerMock.mockClearInterval) as any
    globalThis.setTimeout = vi.fn(TimerMock.mockSetTimeout) as any
    globalThis.clearTimeout = vi.fn(TimerMock.mockClearTimeout) as any

    // Mock localStorage
    this.originalApis.set('localStorage', globalThis.localStorage)
    globalThis.localStorage = new LocalStorageMock() as any

    // Mock console (if needed for specific tests)
    if (process.env.NODE_ENV === 'test') {
      this.originalApis.set('console', globalThis.console)
      globalThis.console = new ConsoleMock() as any
    }

    // Mock geolocation
    this.originalApis.set('navigator', globalThis.navigator)
    globalThis.navigator = {
      ...globalThis.navigator,
      geolocation: new GeolocationMock(),
    } as any

    // Mock ResizeObserver
    this.originalApis.set('ResizeObserver', globalThis.ResizeObserver)
    globalThis.ResizeObserver = ResizeObserverMock as any

    // Mock IntersectionObserver
    this.originalApis.set('IntersectionObserver', globalThis.IntersectionObserver)
    globalThis.IntersectionObserver = IntersectionObserverMock as any
  }

  static teardown() {
    // Restore original APIs
    this.originalApis.forEach((originalApi, key) => {
      if (originalApi !== undefined) {
        ;(globalThis as any)[key] = originalApi
      }
      else {
        delete (globalThis as any)[key]
      }
    })
    this.originalApis.clear()

    // Clear any active timers
    TimerMock.clearAll()
  }

  static reset() {
    // Reset all mocks
    TimerMock.clearAll()
    ;(globalThis.localStorage as any).clear()

    // Reset vi mocks
    vi.clearAllMocks()
  }
}

/**
 * Convenient helpers for common browser API testing scenarios
 */
export const browserApiHelpers = {
  // Create mock image that loads successfully
  createSuccessfulImage: () => {
    const img = new MockImage()
    setTimeout(() => img.simulateLoad(), 0)
    return img
  },

  // Create mock image that fails to load
  createFailedImage: () => {
    const img = new MockImage()
    setTimeout(() => img.simulateError(), 0)
    return img
  },

  // Create mock SVG object that loads successfully
  createSuccessfulSVG: () => {
    const svg = new MockSVGObjectElement()
    setTimeout(() => svg.simulateLoad(), 0)
    return svg
  },

  // Mock successful geolocation
  mockGeolocationSuccess: (coords: GeolocationCoordinates) => {
    const position: GeolocationPosition = {
      coords,
      timestamp: Date.now(),
      toJSON: () => ({ coords, timestamp: Date.now() }),
    }
    ;(globalThis.navigator.geolocation as GeolocationMock).mockSuccess(position)
  },

  // Mock geolocation error
  mockGeolocationError: (code: number, message: string) => {
    const error: GeolocationPositionError = {
      code,
      message,
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    }
    ;(globalThis.navigator.geolocation as GeolocationMock).mockError(error)
  },

  // Wait for next tick (useful for async operations)
  waitForNextTick: () => new Promise(resolve => setTimeout(resolve, 0)),

  // Fast forward timers (if using fake timers)
  fastForwardTimers: (ms: number) => {
    if (vi.isMockFunction(setTimeout)) {
      vi.advanceTimersByTime(ms)
    }
  },
}
