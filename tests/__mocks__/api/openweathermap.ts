/**
 * OpenWeatherMap API mocks for testing
 *
 * Provides mock responses for all OpenWeatherMap API scenarios including
 * success, error, and edge cases for comprehensive testing coverage.
 */

import type {
  WeatherData,
  WeatherApiError,
} from '../../../src/types/weather-api.types'
import type { Mock } from 'vitest'
import { clearSunnyDay } from '../fixtures/weather-scenarios'

/**
 * Mock successful weather data response - now uses 4-day clearSunnyDay scenario
 */
export const mockSuccessResponse: WeatherData = clearSunnyDay

/**
 * Mock API error responses
 */
export const mockErrorResponses = {
  // 401 Unauthorized - Invalid API key
  unauthorized: {
    status: 401,
    ok: false,
    statusText: 'Unauthorized',
    json: async (): Promise<WeatherApiError> => ({
      cod: 401,
      message:
        'Invalid API key. Please see https://openweathermap.org/faq#error401 for more info.',
    }),
  },

  // 404 Not Found - Invalid coordinates
  notFound: {
    status: 404,
    ok: false,
    statusText: 'Not Found',
    json: async (): Promise<WeatherApiError> => ({
      cod: '404',
      message: 'city not found',
    }),
  },

  // 429 Too Many Requests - Rate limiting
  rateLimited: {
    status: 429,
    ok: false,
    statusText: 'Too Many Requests',
    json: async (): Promise<WeatherApiError> => ({
      cod: 429,
      message:
        'Your account is temporary blocked due to exceeding of requests limitation of your subscription type.',
    }),
  },

  // 500 Internal Server Error
  serverError: {
    status: 500,
    ok: false,
    statusText: 'Internal Server Error',
    json: async (): Promise<WeatherApiError> => ({
      cod: 500,
      message: 'Internal server error',
    }),
  },

  // Network error (no status)
  networkError: {
    status: 0,
    ok: false,
    statusText: 'Network Error',
    json: async () => {
      throw new Error('Network request failed')
    },
  },

  // Invalid JSON response
  invalidJson: {
    status: 200,
    ok: true,
    statusText: 'OK',
    json: async () => {
      throw new SyntaxError('Unexpected token < in JSON at position 0')
    },
  },

  // HTTP error with non-JSON response body (e.g., HTML error page)
  errorWithInvalidJson: {
    status: 503,
    ok: false,
    statusText: 'Service Unavailable',
    json: async () => {
      throw new SyntaxError('Unexpected token < in JSON at position 0')
    },
  },
}

/**
 * Mock responses for edge cases and missing data scenarios
 */
export const mockEdgeCaseResponses = {
  // Missing moonrise/moonset data
  missingMoonData: {
    ...mockSuccessResponse,
    daily: [
      {
        ...mockSuccessResponse.daily[0],
        moonrise: 0, // No moonrise that day
        moonset: 0, // No moonset that day
      },
    ],
  },

  // Null values in weather data
  nullValues: {
    ...mockSuccessResponse,
    current: {
      ...mockSuccessResponse.current,
      wind_gust: null,
      rain: null,
      snow: null,
    },
    daily: [
      {
        ...mockSuccessResponse.daily[0],
        rain: null,
        snow: null,
        wind_gust: null,
      },
    ],
  },

  // Extreme weather values
  extremeWeather: {
    ...mockSuccessResponse,
    current: {
      ...mockSuccessResponse.current,
      temp: -40.0,
      feels_like: -45.2,
      humidity: 100,
      uvi: 0,
      wind_speed: 65.3,
      visibility: 50,
      weather: [
        {
          id: 781,
          main: 'Tornado',
          description: 'tornado',
          icon: '50d',
        },
      ],
    },
  },

  // Empty daily array
  emptyDaily: {
    ...mockSuccessResponse,
    daily: [],
  },

  // Minimal response (only required fields)
  minimal: {
    lat: 40.7128,
    lon: -74.006,
    timezone: 'America/New_York',
    timezone_offset: -18000,
    current: {
      dt: 1640995200,
      sunrise: 1640966400,
      sunset: 1641002400,
      temp: 32.5,
      feels_like: 28.9,
      pressure: 1013,
      humidity: 65,
      dew_point: 23.4,
      uvi: 2.5,
      clouds: 20,
      visibility: 10000,
      wind_speed: 8.5,
      wind_deg: 180,
      weather: [
        {
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d',
        },
      ],
    },
    daily: [],
  },
}

/**
 * Helper function to create fetch mock responses
 */
export function createMockFetchResponse(
  data: unknown,
  init: Partial<Response> = {}
) {
  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    ...init,
  } as Response)
}

/**
 * Helper function to create fetch rejection
 */
export function createMockFetchRejection(error: Error) {
  return Promise.reject(error)
}

/**
 * Utility to mock OpenWeatherMap API calls
 */
export class OpenWeatherMapMock {
  private static originalFetch: typeof global.fetch

  static setup() {
    this.originalFetch = global.fetch
    global.fetch = vi.fn()
  }

  static teardown() {
    global.fetch = this.originalFetch
  }

  static mockSuccess(data: WeatherData = mockSuccessResponse) {
    ;(global.fetch as Mock).mockResolvedValueOnce(createMockFetchResponse(data))
  }

  static mockError(errorType: keyof typeof mockErrorResponses) {
    const errorResponse = mockErrorResponses[errorType]
    ;(global.fetch as Mock).mockResolvedValueOnce(errorResponse)
  }

  static mockEdgeCase(caseType: keyof typeof mockEdgeCaseResponses) {
    const edgeCaseData = mockEdgeCaseResponses[caseType]
    ;(global.fetch as Mock).mockResolvedValueOnce(
      createMockFetchResponse(edgeCaseData)
    )
  }

  static mockNetworkFailure() {
    ;(global.fetch as Mock).mockRejectedValueOnce(
      new TypeError('Network request failed')
    )
  }

  static mockCustomResponse(response: Partial<Response>) {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({}),
      ...response,
    })
  }

  static verifyApiCall(expectedUrl: string, expectedOptions?: RequestInit) {
    expect(global.fetch).toHaveBeenCalledWith(expectedUrl, expectedOptions)
  }

  static verifyApiCallCount(expectedCount: number) {
    expect(global.fetch).toHaveBeenCalledTimes(expectedCount)
  }

  static reset() {
    ;(global.fetch as Mock).mockReset()
  }
}
