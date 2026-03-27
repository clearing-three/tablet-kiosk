/**
 * Mock exports index
 *
 * Central export point for all mock utilities and fixtures.
 * Import mocks from this file for consistent testing.
 */

// API Mocks
export * from './api/openweathermap'

// Convenience re-exports for common testing patterns
export {
  mockEdgeCaseResponses,
  mockErrorResponses,
  mockSuccessResponse,
  OpenWeatherMapMock,
} from './api/openweathermap'

// DOM and Browser API Mocks
export * from './dom/browser-apis'

export {
  browserApiHelpers,
  BrowserApiMock,
  ConsoleMock,
  LocalStorageMock,
  TimerMock,
} from './dom/browser-apis'

// Test Fixtures
export * from './fixtures/weather-scenarios'

export {
  createCustomScenario,
  getWeatherScenario,
  weatherScenarios,
} from './fixtures/weather-scenarios'
