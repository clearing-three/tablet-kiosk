// Global test setup file
import 'jest-environment-jsdom'

// Mock environment variables for tests
process.env.VITE_API_KEY = 'test-api-key'
process.env.VITE_LAT = '40.7128'
process.env.VITE_LON = '-74.0060'

// Mock console.error to reduce noise in tests unless explicitly testing error scenarios
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
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

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock setInterval and clearInterval for timer management
global.setInterval = jest.fn((fn: () => void) => {
  // Return a mock timer ID
  return setTimeout(fn, 0) // Execute immediately in tests
}) as any

global.clearInterval = jest.fn()

// Mock Image constructor for weather icon testing
global.Image = class {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src: string = ''

  constructor() {
    // Simulate successful image loading in tests
    setTimeout(() => {
      if (this.onload) {
        this.onload()
      }
    }, 0)
  }
} as any

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
