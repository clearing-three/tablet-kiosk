/**
 * OpenWeatherMap API mocks for testing
 *
 * Provides mock responses for all OpenWeatherMap API scenarios including
 * success, error, and edge cases for comprehensive testing coverage.
 */

import type {
  WeatherData,
  WeatherApiError,
} from '../../../src/types/weather.types'

/**
 * Mock successful weather data response
 */
export const mockSuccessResponse: WeatherData = {
  lat: 40.7128,
  lon: -74.006,
  timezone: 'America/New_York',
  timezone_offset: -18000,
  current: {
    dt: 1640995200, // 2022-01-01 00:00:00 UTC
    sunrise: 1640966400, // 06:00:00 UTC
    sunset: 1641002400, // 16:00:00 UTC
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
  daily: [
    {
      dt: 1640995200,
      sunrise: 1640966400,
      sunset: 1641002400,
      moonrise: 1640980800,
      moonset: 1641024000,
      moon_phase: 0.25,
      temp: {
        day: 35.2,
        min: 28.1,
        max: 42.3,
        night: 30.5,
        eve: 38.7,
        morn: 29.8,
      },
      feels_like: {
        day: 32.1,
        night: 27.3,
        eve: 35.4,
        morn: 26.9,
      },
      pressure: 1013,
      humidity: 65,
      dew_point: 23.4,
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
      clouds: 20,
      pop: 0.1,
      uvi: 2.5,
    },
    {
      dt: 1641081600,
      sunrise: 1641052800,
      sunset: 1641088800,
      moonrise: 1641067200,
      moonset: 1641110400,
      moon_phase: 0.5,
      temp: {
        day: 38.7,
        min: 31.2,
        max: 45.6,
        night: 34.1,
        eve: 41.8,
        morn: 32.5,
      },
      feels_like: {
        day: 35.2,
        night: 30.1,
        eve: 38.3,
        morn: 29.7,
      },
      pressure: 1010,
      humidity: 70,
      dew_point: 26.8,
      wind_speed: 9.2,
      wind_deg: 200,
      weather: [
        {
          id: 801,
          main: 'Clouds',
          description: 'few clouds',
          icon: '02d',
        },
      ],
      clouds: 40,
      pop: 0.3,
      uvi: 3.1,
    },
    {
      dt: 1641168000,
      sunrise: 1641139200,
      sunset: 1641175200,
      moonrise: 1641153600,
      moonset: 1641196800,
      moon_phase: 0.75,
      temp: {
        day: 29.3,
        min: 22.1,
        max: 36.7,
        night: 25.4,
        eve: 32.8,
        morn: 23.9,
      },
      feels_like: {
        day: 26.1,
        night: 22.3,
        eve: 29.5,
        morn: 20.7,
      },
      pressure: 1008,
      humidity: 80,
      dew_point: 28.3,
      wind_speed: 12.1,
      wind_deg: 220,
      weather: [
        {
          id: 500,
          main: 'Rain',
          description: 'light rain',
          icon: '10d',
        },
      ],
      clouds: 75,
      pop: 0.8,
      rain: 2.5,
      uvi: 1.8,
    },
  ],
}

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
    global.fetch = jest.fn()
  }

  static teardown() {
    global.fetch = this.originalFetch
  }

  static mockSuccess(data: WeatherData = mockSuccessResponse) {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(
      createMockFetchResponse(data)
    )
  }

  static mockError(errorType: keyof typeof mockErrorResponses) {
    const errorResponse = mockErrorResponses[errorType]
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(errorResponse)
  }

  static mockEdgeCase(caseType: keyof typeof mockEdgeCaseResponses) {
    const edgeCaseData = mockEdgeCaseResponses[caseType]
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(
      createMockFetchResponse(edgeCaseData)
    )
  }

  static mockNetworkFailure() {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network request failed')
    )
  }

  static mockCustomResponse(response: Partial<Response>) {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
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
    ;(global.fetch as jest.Mock).mockReset()
  }
}
