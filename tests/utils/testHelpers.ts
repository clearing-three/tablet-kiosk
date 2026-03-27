// Test utility functions and helpers

import type { Mock } from 'vitest'
import type { WeatherApiData } from '../../src/types/weather-api.types'
import type { SolarTimes } from '../../src/types/weather-domain.types'

/**
 * Creates mock weather data for testing
 */
export function createMockWeatherData(
  overrides: Partial<WeatherApiData> = {},
): WeatherApiData {
  return {
    lat: 40.7128,
    lon: -74.006,
    timezone: 'America/New_York',
    timezone_offset: -18000,
    current: {
      dt: 1640995200, // 2022-01-01 00:00:00 UTC
      temp: 20,
      feels_like: 18,
      humidity: 65,
      pressure: 1013,
      dew_point: 12,
      uvi: 5,
      clouds: 25,
      visibility: 10000,
      wind_speed: 3.5,
      wind_deg: 180,
      weather: [
        {
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d',
        },
      ],
      sunrise: 1640966400, // 06:00:00 UTC
      sunset: 1641002400, // 16:00:00 UTC
    },
    daily: [
      {
        dt: 1640995200,
        temp: { day: 22, night: 15, eve: 20, morn: 18, min: 15, max: 25 },
        feels_like: { day: 21, night: 14, eve: 19, morn: 17 },
        pressure: 1013,
        humidity: 65,
        dew_point: 12,
        wind_speed: 3.5,
        wind_deg: 180,
        clouds: 25,
        pop: 0.1,
        uvi: 5,
        weather: [
          {
            id: 800,
            main: 'Clear',
            description: 'clear sky',
            icon: '01d',
          },
        ],
        sunrise: 1640966400,
        sunset: 1641002400,
        moon_phase: 0.25,
      },
      {
        dt: 1641081600,
        temp: { day: 25, night: 18, eve: 23, morn: 20, min: 18, max: 28 },
        feels_like: { day: 24, night: 17, eve: 22, morn: 19 },
        pressure: 1010,
        humidity: 70,
        dew_point: 15,
        wind_speed: 4.2,
        wind_deg: 200,
        clouds: 40,
        pop: 0.3,
        uvi: 6,
        weather: [
          {
            id: 801,
            main: 'Clouds',
            description: 'few clouds',
            icon: '02d',
          },
        ],
        sunrise: 1641052800,
        sunset: 1641088800,
        moon_phase: 0.5,
      },
      {
        dt: 1641168000,
        temp: { day: 19, night: 12, eve: 17, morn: 14, min: 12, max: 22 },
        feels_like: { day: 18, night: 11, eve: 16, morn: 13 },
        pressure: 1008,
        humidity: 80,
        dew_point: 16,
        wind_speed: 5.5,
        wind_deg: 220,
        clouds: 75,
        pop: 0.8,
        rain: 2.5,
        uvi: 3,
        weather: [
          {
            id: 500,
            main: 'Rain',
            description: 'light rain',
            icon: '10d',
          },
        ],
        sunrise: 1641139200,
        sunset: 1641175200,
        moon_phase: 0.75,
      },
    ],
    ...overrides,
  }
}

/**
 * Creates mock astronomy times for testing
 */
export function createMockAstronomyTimes(
  overrides: Partial<SolarTimes> = {},
): SolarTimes {
  return {
    sunrise: 1640966400, // 06:00:00 UTC
    sunset: 1641002400, // 16:00:00 UTC
    ...overrides,
  }
}

/**
 * Creates mock API responses for testing
 */
export const mockApiResponses = {
  success: {
    status: 200,
    json: async () => createMockWeatherData(),
  },

  networkError: {
    status: 0,
    ok: false,
    statusText: 'Network Error',
  },

  notFound: {
    status: 404,
    ok: false,
    statusText: 'Not Found',
    json: async () => ({ message: 'Not Found' }),
  },

  serverError: {
    status: 500,
    ok: false,
    statusText: 'Internal Server Error',
    json: async () => ({ message: 'Internal Server Error' }),
  },

  invalidJson: {
    status: 200,
    ok: true,
    json: async () => {
      throw new Error('Invalid JSON')
    },
  },

  rateLimited: {
    status: 429,
    ok: false,
    statusText: 'Too Many Requests',
    json: async () => ({ message: 'Too Many Requests' }),
  },
}

/**
 * Helper to mock fetch responses
 */
export function mockFetch(response: Partial<Response>) {
  ;(globalThis.fetch as Mock).mockResolvedValueOnce(response)
}

/**
 * Helper to mock fetch rejections
 */
export function mockFetchRejection(error: Error) {
  ;(globalThis.fetch as Mock).mockRejectedValueOnce(error)
}

/**
 * Helper to wait for async operations in tests
 */
export function waitFor(ms: number = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Helper to trigger DOM events
 */
export function triggerEvent(
  element: Element,
  eventType: string,
  eventInit?: EventInit,
) {
  const event = new Event(eventType, eventInit)
  element.dispatchEvent(event)
}

/**
 * Helper to check if element has specific text content
 */
export function hasTextContent(
  element: Element | null,
  expectedText: string,
): boolean {
  if (!element)
    return false
  return element.textContent?.trim() === expectedText
}

/**
 * Helper to find element by test id (data-testid attribute)
 */
export function getByTestId(testId: string): Element | null {
  return document.querySelector(`[data-testid="${testId}"]`)
}

/**
 * Helper to find all elements by test id
 */
export function getAllByTestId(testId: string): NodeListOf<Element> {
  return document.querySelectorAll(`[data-testid="${testId}"]`)
}

/**
 * Helper to simulate user interactions
 */
export const userEvent = {
  click: (element: Element) => {
    triggerEvent(element, 'click', { bubbles: true })
  },

  focus: (element: Element) => {
    triggerEvent(element, 'focus', { bubbles: true })
  },

  blur: (element: Element) => {
    triggerEvent(element, 'blur', { bubbles: true })
  },
}

/**
 * Helper to test error scenarios consistently
 */
export function expectErrorHandling(
  testFn: () => Promise<void> | void,
  expectedError?: string | RegExp,
) {
  return async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      await testFn()

      if (expectedError) {
        if (typeof expectedError === 'string') {
          expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining(expectedError),
          )
        }
        else {
          expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringMatching(expectedError),
          )
        }
      }
    }
    finally {
      consoleSpy.mockRestore()
    }
  }
}
