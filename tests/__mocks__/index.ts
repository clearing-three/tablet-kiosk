/**
 * Mock exports index
 *
 * Central export point for all mock utilities and fixtures.
 * Import mocks from this file for consistent testing.
 */

// API Mocks
export * from './api/openweathermap'

// Library Mocks
export * from './libraries/moon-phase'

// DOM and Browser API Mocks
export * from './dom/browser-apis'

// Test Fixtures
export * from './fixtures/weather-scenarios'

// Convenience re-exports for common testing patterns
export {
  OpenWeatherMapMock,
  mockSuccessResponse,
  mockErrorResponses,
  mockEdgeCaseResponses,
} from './api/openweathermap'

export {
  MoonPhaseMock,
  moonPhaseTestHelpers,
  mockMoonPhaseData,
} from './libraries/moon-phase'

export {
  BrowserApiMock,
  browserApiHelpers,
  TimerMock,
  LocalStorageMock,
  ConsoleMock,
} from './dom/browser-apis'

export {
  weatherScenarios,
  getWeatherScenario,
  createCustomScenario,
} from './fixtures/weather-scenarios'
