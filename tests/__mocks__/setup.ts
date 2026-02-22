/**
 * Mock setup utilities
 *
 * Provides centralized setup and teardown for all mocks used in testing.
 * This integrates with the existing test setup to provide a comprehensive
 * mock environment.
 */

import { OpenWeatherMapMock } from './api/openweathermap'
import { MoonPhaseMock } from './libraries/moon-phase'
import { BrowserApiMock } from './dom/browser-apis'

/**
 * Global mock setup for all tests
 * Call this in your test setup files or individual test suites
 */
export function setupAllMocks() {
  // Set up API mocks
  OpenWeatherMapMock.setup()

  // Set up library mocks
  MoonPhaseMock.setup()

  // Set up browser API mocks
  BrowserApiMock.setup()

  // Additional global mocks can be added here
}

/**
 * Global mock teardown
 * Call this in test cleanup or afterAll hooks
 */
export function teardownAllMocks() {
  // Teardown in reverse order
  BrowserApiMock.teardown()
  MoonPhaseMock.teardown()
  OpenWeatherMapMock.teardown()
}

/**
 * Reset all mocks between tests
 * Call this in beforeEach or between test cases
 */
export function resetAllMocks() {
  // Reset individual mock systems
  OpenWeatherMapMock.reset()
  MoonPhaseMock.reset()
  BrowserApiMock.reset()

  vi.clearAllMocks()
}

/**
 * Quick setup for common test scenarios
 */
export const mockScenarios = {
  /**
   * Set up mocks for successful weather data flow
   */
  successfulWeatherFlow: () => {
    OpenWeatherMapMock.mockSuccess()
    MoonPhaseMock.mockPhase(0.25) // First quarter moon
  },

  /**
   * Set up mocks for API error scenarios
   */
  apiErrorFlow: () => {
    OpenWeatherMapMock.mockError('serverError')
    MoonPhaseMock.mockPhase(0.0) // New moon as fallback
  },

  /**
   * Set up mocks for network failure scenarios
   */
  networkFailureFlow: () => {
    OpenWeatherMapMock.mockNetworkFailure()
    MoonPhaseMock.mockPhase(0.5) // Full moon as fallback
  },

  /**
   * Set up mocks for edge case scenarios
   */
  edgeCaseFlow: () => {
    OpenWeatherMapMock.mockEdgeCase('missingMoonData')
    MoonPhaseMock.mockEdgeCases()
  },

  /**
   * Set up mocks for extreme weather scenarios
   */
  extremeWeatherFlow: () => {
    OpenWeatherMapMock.mockEdgeCase('extremeWeather')
    MoonPhaseMock.mockPhase(0.75) // Last quarter moon
  },
}

/**
 * Utility class for test-specific mock management
 */
export class TestMockManager {
  private activeMocks: Set<string> = new Set()

  /**
   * Set up specific mocks for a test
   */
  setup(mockTypes: Array<'api' | 'moon-phase' | 'browser-apis' | 'all'>) {
    mockTypes.forEach(type => {
      switch (type) {
        case 'api':
          OpenWeatherMapMock.setup()
          this.activeMocks.add('api')
          break
        case 'moon-phase':
          MoonPhaseMock.setup()
          this.activeMocks.add('moon-phase')
          break
        case 'browser-apis':
          BrowserApiMock.setup()
          this.activeMocks.add('browser-apis')
          break
        case 'all':
          setupAllMocks()
          this.activeMocks.add('all')
          break
      }
    })
  }

  /**
   * Reset only the active mocks
   */
  reset() {
    if (this.activeMocks.has('all') || this.activeMocks.has('api')) {
      OpenWeatherMapMock.reset()
    }
    if (this.activeMocks.has('all') || this.activeMocks.has('moon-phase')) {
      MoonPhaseMock.reset()
    }
    if (this.activeMocks.has('all') || this.activeMocks.has('browser-apis')) {
      BrowserApiMock.reset()
    }
  }

  /**
   * Teardown only the active mocks
   */
  teardown() {
    if (this.activeMocks.has('all')) {
      teardownAllMocks()
    } else {
      if (this.activeMocks.has('browser-apis')) {
        BrowserApiMock.teardown()
      }
      if (this.activeMocks.has('moon-phase')) {
        MoonPhaseMock.teardown()
      }
      if (this.activeMocks.has('api')) {
        OpenWeatherMapMock.teardown()
      }
    }
    this.activeMocks.clear()
  }
}

/**
 * Decorator for test functions that need specific mocks
 */
export function withMocks<T extends any[]>(
  mockTypes: Array<'api' | 'moon-phase' | 'browser-apis' | 'all'>,
  testFn: (...args: T) => void | Promise<void>
) {
  return async (...args: T) => {
    const manager = new TestMockManager()
    manager.setup(mockTypes)

    try {
      await testFn(...args)
    } finally {
      manager.teardown()
    }
  }
}

/**
 * Helper to create isolated test environment with mocks
 */
export function createIsolatedTestEnvironment() {
  const manager = new TestMockManager()

  return {
    setup: (
      mockTypes: Array<'api' | 'moon-phase' | 'browser-apis' | 'all'>
    ) => {
      manager.setup(mockTypes)
    },
    reset: () => manager.reset(),
    teardown: () => manager.teardown(),

    // Quick scenario setups
    scenarios: {
      success: () => mockScenarios.successfulWeatherFlow(),
      error: () => mockScenarios.apiErrorFlow(),
      networkFailure: () => mockScenarios.networkFailureFlow(),
      edgeCase: () => mockScenarios.edgeCaseFlow(),
      extremeWeather: () => mockScenarios.extremeWeatherFlow(),
    },
  }
}

/**
 * Default export for easy importing
 */
export default {
  setupAllMocks,
  teardownAllMocks,
  resetAllMocks,
  mockScenarios,
  TestMockManager,
  withMocks,
  createIsolatedTestEnvironment,
}
