// Global test setup file
import {
  resetAllMocks,
  setupAllMocks,
  teardownAllMocks,
} from './__mocks__/setup'

// Set up all mocks before tests start
beforeAll(() => {
  setupAllMocks()
})

// Reset mocks between tests to ensure test isolation
beforeEach(() => {
  resetAllMocks()
})

// Clean up mocks after all tests complete
afterAll(() => {
  teardownAllMocks()
})

// Global DOM setup for tablet kiosk environment
beforeEach(() => {
  // Reset DOM to basic structure that matches our app
  document.body.innerHTML = `
    <div class="app">
      <div class="left-panel">
        <div class="weather-section">
          <div id="temperature"></div>
          <div id="weather-description"></div>
          <div id="weather-icon"></div>
        </div>
        <div class="forecast-section">
          <div id="forecast-container"></div>
        </div>
      </div>
      <div class="right-panel">
        <div class="time-section">
          <div id="current-time"></div>
          <div id="current-date"></div>
        </div>
        <div class="astronomy-section">
          <div id="sunrise-time"></div>
          <div id="sunset-time"></div>
        </div>
        <div class="moon-section">
          <div id="moon-phase-container"></div>
        </div>
      </div>
    </div>
  `
})

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      }
    }
    else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      }
    }
  },
})

declare module 'vitest' {
  interface Assertion<T = any> {
    toBeWithinRange: (floor: number, ceiling: number) => T
  }
}
