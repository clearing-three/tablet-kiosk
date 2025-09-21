/**
 * Weather scenario fixtures for comprehensive testing
 *
 * Provides realistic weather data fixtures for various scenarios
 * including normal conditions, extreme weather, and edge cases.
 */

import type { WeatherData } from '../../../src/types/weather.types'

/**
 * Clear sunny day scenario
 */
export const clearSunnyDay: WeatherData = {
  lat: 40.7128,
  lon: -74.006,
  timezone: 'America/New_York',
  timezone_offset: -18000,
  current: {
    dt: 1640995200, // 2022-01-01 12:00:00 UTC
    sunrise: 1640966400, // 06:00:00 UTC
    sunset: 1641002400, // 16:00:00 UTC
    temp: 75.2,
    feels_like: 78.1,
    pressure: 1020,
    humidity: 45,
    dew_point: 52.3,
    uvi: 8.5,
    clouds: 5,
    visibility: 10000,
    wind_speed: 5.2,
    wind_deg: 210,
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
      moon_phase: 0.0, // New moon
      temp: {
        day: 75.2,
        min: 58.3,
        max: 82.4,
        night: 62.1,
        eve: 78.5,
        morn: 60.7,
      },
      feels_like: {
        day: 78.1,
        night: 64.2,
        eve: 81.3,
        morn: 62.9,
      },
      pressure: 1020,
      humidity: 45,
      dew_point: 52.3,
      wind_speed: 5.2,
      wind_deg: 210,
      weather: [
        {
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d',
        },
      ],
      clouds: 5,
      pop: 0.0,
      uvi: 8.5,
    },
  ],
}

/**
 * Rainy stormy day scenario
 */
export const rainyStormyDay: WeatherData = {
  lat: 40.7128,
  lon: -74.006,
  timezone: 'America/New_York',
  timezone_offset: -18000,
  current: {
    dt: 1640995200,
    sunrise: 1640966400,
    sunset: 1641002400,
    temp: 45.7,
    feels_like: 38.2,
    pressure: 995,
    humidity: 85,
    dew_point: 41.8,
    uvi: 1.2,
    clouds: 90,
    visibility: 3000,
    wind_speed: 22.5,
    wind_deg: 245,
    wind_gust: 35.8,
    weather: [
      {
        id: 502,
        main: 'Rain',
        description: 'heavy intensity rain',
        icon: '10d',
      },
      {
        id: 781,
        main: 'Squall',
        description: 'squalls',
        icon: '50d',
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
      moon_phase: 0.75, // Last quarter
      temp: {
        day: 45.7,
        min: 38.2,
        max: 52.1,
        night: 41.5,
        eve: 43.8,
        morn: 39.6,
      },
      feels_like: {
        day: 38.2,
        night: 35.1,
        eve: 37.4,
        morn: 32.8,
      },
      pressure: 995,
      humidity: 85,
      dew_point: 41.8,
      wind_speed: 22.5,
      wind_deg: 245,
      wind_gust: 35.8,
      weather: [
        {
          id: 502,
          main: 'Rain',
          description: 'heavy intensity rain',
          icon: '10d',
        },
      ],
      clouds: 90,
      pop: 0.9,
      rain: 15.7,
      uvi: 1.2,
    },
  ],
}

/**
 * Snowy winter day scenario
 */
export const snowyWinterDay: WeatherData = {
  lat: 40.7128,
  lon: -74.006,
  timezone: 'America/New_York',
  timezone_offset: -18000,
  current: {
    dt: 1640995200,
    sunrise: 1640966400,
    sunset: 1641002400,
    temp: 28.4,
    feels_like: 18.7,
    pressure: 1010,
    humidity: 78,
    dew_point: 23.1,
    uvi: 0.8,
    clouds: 100,
    visibility: 1200,
    wind_speed: 12.3,
    wind_deg: 15,
    weather: [
      {
        id: 602,
        main: 'Snow',
        description: 'heavy snow',
        icon: '13d',
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
      moon_phase: 0.5, // Full moon
      temp: {
        day: 28.4,
        min: 19.8,
        max: 32.1,
        night: 22.5,
        eve: 26.7,
        morn: 21.3,
      },
      feels_like: {
        day: 18.7,
        night: 12.4,
        eve: 16.9,
        morn: 13.2,
      },
      pressure: 1010,
      humidity: 78,
      dew_point: 23.1,
      wind_speed: 12.3,
      wind_deg: 15,
      weather: [
        {
          id: 602,
          main: 'Snow',
          description: 'heavy snow',
          icon: '13d',
        },
      ],
      clouds: 100,
      pop: 0.85,
      snow: 8.2,
      uvi: 0.8,
    },
  ],
}

/**
 * Extreme heat scenario
 */
export const extremeHeat: WeatherData = {
  lat: 33.4484,
  lon: -112.074, // Phoenix, AZ
  timezone: 'America/Phoenix',
  timezone_offset: -25200,
  current: {
    dt: 1640995200,
    sunrise: 1640966400,
    sunset: 1641002400,
    temp: 118.5,
    feels_like: 125.3,
    pressure: 1005,
    humidity: 15,
    dew_point: 32.1,
    uvi: 11.2,
    clouds: 0,
    visibility: 10000,
    wind_speed: 8.7,
    wind_deg: 270,
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
      moon_phase: 0.25, // First quarter
      temp: {
        day: 118.5,
        min: 95.2,
        max: 121.8,
        night: 98.7,
        eve: 115.3,
        morn: 97.1,
      },
      feels_like: {
        day: 125.3,
        night: 102.4,
        eve: 122.1,
        morn: 100.8,
      },
      pressure: 1005,
      humidity: 15,
      dew_point: 32.1,
      wind_speed: 8.7,
      wind_deg: 270,
      weather: [
        {
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d',
        },
      ],
      clouds: 0,
      pop: 0.0,
      uvi: 11.2,
    },
  ],
}

/**
 * Extreme cold scenario
 */
export const extremeCold: WeatherData = {
  lat: 64.2008,
  lon: -149.4937, // Fairbanks, AK
  timezone: 'America/Anchorage',
  timezone_offset: -32400,
  current: {
    dt: 1640995200,
    sunrise: 1640966400,
    sunset: 1641002400,
    temp: -35.7,
    feels_like: -48.2,
    pressure: 1025,
    humidity: 65,
    dew_point: -42.1,
    uvi: 0.1,
    clouds: 75,
    visibility: 8000,
    wind_speed: 15.2,
    wind_deg: 45,
    weather: [
      {
        id: 701,
        main: 'Mist',
        description: 'mist',
        icon: '50d',
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
      moon_phase: 0.125, // Waxing crescent
      temp: {
        day: -35.7,
        min: -42.3,
        max: -28.4,
        night: -40.1,
        eve: -32.8,
        morn: -41.5,
      },
      feels_like: {
        day: -48.2,
        night: -52.7,
        eve: -45.3,
        morn: -51.2,
      },
      pressure: 1025,
      humidity: 65,
      dew_point: -42.1,
      wind_speed: 15.2,
      wind_deg: 45,
      weather: [
        {
          id: 701,
          main: 'Mist',
          description: 'mist',
          icon: '50d',
        },
      ],
      clouds: 75,
      pop: 0.2,
      uvi: 0.1,
    },
  ],
}

/**
 * Missing moon data scenario
 */
export const missingMoonData: WeatherData = {
  ...clearSunnyDay,
  daily: [
    {
      ...clearSunnyDay.daily[0],
      moonrise: 0, // No moonrise that day
      moonset: 0, // No moonset that day
    },
  ],
}

/**
 * Multi-day forecast scenario
 */
export const multiDayForecast: WeatherData = {
  lat: 40.7128,
  lon: -74.006,
  timezone: 'America/New_York',
  timezone_offset: -18000,
  current: clearSunnyDay.current,
  daily: [
    // Today - Clear
    {
      dt: 1640995200,
      sunrise: 1640966400,
      sunset: 1641002400,
      moonrise: 1640980800,
      moonset: 1641024000,
      moon_phase: 0.0,
      temp: {
        day: 75.2,
        min: 58.3,
        max: 82.4,
        night: 62.1,
        eve: 78.5,
        morn: 60.7,
      },
      feels_like: { day: 78.1, night: 64.2, eve: 81.3, morn: 62.9 },
      pressure: 1020,
      humidity: 45,
      dew_point: 52.3,
      wind_speed: 5.2,
      wind_deg: 210,
      weather: [
        { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' },
      ],
      clouds: 5,
      pop: 0.0,
      uvi: 8.5,
    },
    // Tomorrow - Partly cloudy
    {
      dt: 1641081600,
      sunrise: 1641052800,
      sunset: 1641088800,
      moonrise: 1641067200,
      moonset: 1641110400,
      moon_phase: 0.125,
      temp: {
        day: 68.4,
        min: 55.1,
        max: 74.8,
        night: 58.9,
        eve: 71.2,
        morn: 57.3,
      },
      feels_like: { day: 70.2, night: 60.1, eve: 73.4, morn: 58.8 },
      pressure: 1015,
      humidity: 55,
      dew_point: 54.7,
      wind_speed: 7.8,
      wind_deg: 195,
      weather: [
        { id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' },
      ],
      clouds: 25,
      pop: 0.1,
      uvi: 7.2,
    },
    // Day after - Rainy
    {
      dt: 1641168000,
      sunrise: 1641139200,
      sunset: 1641175200,
      moonrise: 1641153600,
      moonset: 1641196800,
      moon_phase: 0.25,
      temp: {
        day: 52.3,
        min: 45.7,
        max: 58.1,
        night: 48.2,
        eve: 54.8,
        morn: 47.1,
      },
      feels_like: { day: 48.9, night: 44.3, eve: 51.2, morn: 43.8 },
      pressure: 1002,
      humidity: 75,
      dew_point: 46.8,
      wind_speed: 12.5,
      wind_deg: 225,
      weather: [
        { id: 500, main: 'Rain', description: 'light rain', icon: '10d' },
      ],
      clouds: 80,
      pop: 0.7,
      rain: 3.2,
      uvi: 3.8,
    },
  ],
}

/**
 * Edge case with null/undefined values
 */
export const nullValuesScenario: WeatherData = {
  ...clearSunnyDay,
  current: {
    ...clearSunnyDay.current,
    wind_gust: undefined,
  },
  daily: [
    {
      ...clearSunnyDay.daily[0],
      rain: undefined as any,
      snow: undefined as any,
      wind_gust: null as any,
    },
  ],
}

/**
 * API response with minimum required fields only
 */
export const minimalResponse: WeatherData = {
  lat: 40.7128,
  lon: -74.006,
  timezone: 'America/New_York',
  timezone_offset: -18000,
  current: {
    dt: 1640995200,
    sunrise: 1640966400,
    sunset: 1641002400,
    temp: 75.2,
    feels_like: 78.1,
    pressure: 1020,
    humidity: 45,
    dew_point: 52.3,
    uvi: 8.5,
    clouds: 5,
    visibility: 10000,
    wind_speed: 5.2,
    wind_deg: 210,
    weather: [
      {
        id: 800,
        main: 'Clear',
        description: 'clear sky',
        icon: '01d',
      },
    ],
  },
  daily: [], // Empty daily array
}

/**
 * All weather scenarios for easy access
 */
export const weatherScenarios = {
  clearSunnyDay,
  rainyStormyDay,
  snowyWinterDay,
  extremeHeat,
  extremeCold,
  missingMoonData,
  multiDayForecast,
  nullValuesScenario,
  minimalResponse,
}

/**
 * Helper function to get a scenario by name
 */
export function getWeatherScenario(
  scenarioName: keyof typeof weatherScenarios
): WeatherData {
  return weatherScenarios[scenarioName]
}

/**
 * Helper function to create custom scenario variations
 */
export function createCustomScenario(
  baseScenario: WeatherData,
  overrides: Partial<WeatherData>
): WeatherData {
  return {
    ...baseScenario,
    ...overrides,
    current: {
      ...baseScenario.current,
      ...overrides.current,
    },
    daily: overrides.daily || baseScenario.daily,
  }
}
