// Global test setup file
import 'jest-environment-jsdom'
import {
  setupAllMocks,
  teardownAllMocks,
  resetAllMocks,
} from './__mocks__/setup'
import './testEnvironment'

// Mock environment variables for tests
process.env.VITE_API_KEY = 'test-api-key'
process.env.VITE_LAT = '40.7128'
process.env.VITE_LON = '-74.0060'

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
          <div id="moonrise-time"></div>
          <div id="moonset-time"></div>
        </div>
        <div class="moon-section">
          <div id="moon-phase-container"></div>
          <div id="moon-phase-name"></div>
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
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      }
    }
  },
})

// Type augmentation for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R
    }
  }
}
