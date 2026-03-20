/**
 * Weather scenario fixtures for comprehensive testing
 *
 * Provides realistic weather data fixtures for various scenarios
 * including normal conditions, extreme weather, and edge cases.
 * ALL SCENARIOS NOW INCLUDE REQUIRED_FORECAST_DAYS DAYS OF DATA (today + forecast days).
 */

import type {
  WeatherApiData,
  DailyWeather,
} from '../../../src/types/weather-api.types'
import { REQUIRED_FORECAST_DAYS } from '../../../src/constants/weather.constants'

/**
 * Helper function to generate forecast data for the required number of days
 */
function generateFourDayForecast(
  baseDay: DailyWeather,
  weatherPattern: 'clear' | 'rainy' | 'snowy' | 'mixed' = 'clear'
): DailyWeather[] {
  const days: DailyWeather[] = []
  const baseTimestamp = baseDay.dt

  for (let i = 0; i < REQUIRED_FORECAST_DAYS; i++) {
    const dayOffset = i * 24 * 60 * 60 // 24 hours in seconds
    const timestamp = baseTimestamp + dayOffset

    let weatherCondition
    let tempAdjustment

    switch (weatherPattern) {
      case 'rainy':
        weatherCondition =
          i === 0
            ? baseDay.weather[0]
            : {
                id: 500 + (i % 3),
                main: 'Rain',
                description: ['light rain', 'moderate rain', 'heavy rain'][
                  i % 3
                ],
                icon: '10d',
              }
        tempAdjustment = -2 * i // Gets cooler over time
        break
      case 'snowy':
        weatherCondition =
          i === 0
            ? baseDay.weather[0]
            : {
                id: 600 + (i % 3),
                main: 'Snow',
                description: ['light snow', 'moderate snow', 'heavy snow'][
                  i % 3
                ],
                icon: '13d',
              }
        tempAdjustment = -5 * i // Gets much cooler
        break
      case 'mixed': {
        const conditions = [
          baseDay.weather[0],
          { id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' },
          { id: 500, main: 'Rain', description: 'light rain', icon: '10d' },
          { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' },
        ]
        weatherCondition = conditions[i]
        tempAdjustment = (i - 1) * 1.5 // Slight variation
        break
      }
      default: // clear
        weatherCondition =
          i === 0
            ? baseDay.weather[0]
            : {
                id: 800 + (i % 2),
                main: i % 2 === 0 ? 'Clear' : 'Clouds',
                description: i % 2 === 0 ? 'clear sky' : 'few clouds',
                icon: i % 2 === 0 ? '01d' : '02d',
              }
        tempAdjustment = -1 * i // Slightly cooler over time
        break
    }

    days.push({
      dt: timestamp,
      sunrise: baseDay.sunrise + dayOffset,
      sunset: baseDay.sunset + dayOffset,
      moon_phase: (baseDay.moon_phase + i * 0.125) % 1, // Gradual moon phase change
      temp: {
        day: baseDay.temp.day + tempAdjustment,
        min: baseDay.temp.min + tempAdjustment,
        max: baseDay.temp.max + tempAdjustment,
        night: baseDay.temp.night + tempAdjustment,
        eve: baseDay.temp.eve + tempAdjustment,
        morn: baseDay.temp.morn + tempAdjustment,
      },
      feels_like: {
        day: baseDay.feels_like.day + tempAdjustment,
        night: baseDay.feels_like.night + tempAdjustment,
        eve: baseDay.feels_like.eve + tempAdjustment,
        morn: baseDay.feels_like.morn + tempAdjustment,
      },
      pressure: baseDay.pressure + i * 2, // Slight pressure variation
      humidity: Math.max(10, Math.min(90, baseDay.humidity + i * 5)), // Bounded humidity
      dew_point: baseDay.dew_point + tempAdjustment,
      wind_speed: Math.max(0, baseDay.wind_speed + i * 0.5),
      wind_deg: (baseDay.wind_deg + i * 10) % 360,
      weather: [weatherCondition],
      clouds: Math.min(100, baseDay.clouds + i * 10),
      pop: Math.min(1.0, baseDay.pop + i * 0.1),
      uvi: Math.max(0, baseDay.uvi - i * 0.5),
      rain: weatherPattern === 'rainy' && i > 0 ? i * 0.5 : undefined,
      snow: weatherPattern === 'snowy' && i > 0 ? i * 0.3 : undefined,
    })
  }

  return days
}

/**
 * Clear sunny day scenario - 4 days of mostly clear weather
 */
export const clearSunnyDay: WeatherApiData = {
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
  daily: generateFourDayForecast(
    {
      dt: 1640995200,
      sunrise: 1640966400,
      sunset: 1641002400,
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
    'clear'
  ),
}

/**
 * Rainy stormy day scenario - 4 days with increasing rain
 */
export const rainyStormyDay: WeatherApiData = {
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
    visibility: 5000,
    wind_speed: 12.8,
    wind_deg: 260,
    wind_gust: 18.5,
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
  daily: generateFourDayForecast(
    {
      dt: 1640995200,
      sunrise: 1640966400,
      sunset: 1641002400,
      moon_phase: 0.25,
      temp: {
        day: 45.7,
        min: 38.2,
        max: 52.1,
        night: 40.5,
        eve: 48.3,
        morn: 39.8,
      },
      feels_like: { day: 38.2, night: 32.1, eve: 41.7, morn: 33.5 },
      pressure: 995,
      humidity: 85,
      dew_point: 41.8,
      wind_speed: 12.8,
      wind_deg: 260,
      weather: [
        {
          id: 502,
          main: 'Rain',
          description: 'heavy intensity rain',
          icon: '10d',
        },
      ],
      clouds: 90,
      pop: 0.95,
      rain: 8.5,
      uvi: 1.2,
    },
    'rainy'
  ),
}

/**
 * Snowy winter day scenario - 4 days with snow conditions
 */
export const snowyWinterDay: WeatherApiData = {
  lat: 40.7128,
  lon: -74.006,
  timezone: 'America/New_York',
  timezone_offset: -18000,
  current: {
    dt: 1640995200,
    sunrise: 1640966400,
    sunset: 1641002400,
    temp: 28.4,
    feels_like: 18.2,
    pressure: 1008,
    humidity: 78,
    dew_point: 23.1,
    uvi: 2.1,
    clouds: 95,
    visibility: 2000,
    wind_speed: 8.7,
    wind_deg: 340,
    weather: [
      {
        id: 602,
        main: 'Snow',
        description: 'heavy snow',
        icon: '13d',
      },
    ],
  },
  daily: generateFourDayForecast(
    {
      dt: 1640995200,
      sunrise: 1640966400,
      sunset: 1641002400,
      moon_phase: 0.75,
      temp: {
        day: 28.4,
        min: 18.2,
        max: 32.8,
        night: 22.1,
        eve: 30.5,
        morn: 20.3,
      },
      feels_like: { day: 18.2, night: 12.5, eve: 22.8, morn: 14.7 },
      pressure: 1008,
      humidity: 78,
      dew_point: 23.1,
      wind_speed: 8.7,
      wind_deg: 340,
      weather: [
        { id: 602, main: 'Snow', description: 'heavy snow', icon: '13d' },
      ],
      clouds: 95,
      pop: 0.85,
      snow: 5.2,
      uvi: 2.1,
    },
    'snowy'
  ),
}

/**
 * Extreme heat scenario - 4 days of hot weather
 */
export const extremeHeat: WeatherApiData = {
  lat: 40.7128,
  lon: -74.006,
  timezone: 'America/New_York',
  timezone_offset: -18000,
  current: {
    ...clearSunnyDay.current,
    temp: 118.5,
    feels_like: 125.3,
    humidity: 15,
    dew_point: 72.3,
  },
  daily: generateFourDayForecast(
    {
      dt: 1640995200,
      sunrise: 1640966400,
      sunset: 1641002400,
      moon_phase: 0.5,
      temp: {
        day: 115.7,
        min: 98.3,
        max: 122.4,
        night: 102.1,
        eve: 118.5,
        morn: 100.7,
      },
      feels_like: { day: 125.1, night: 108.2, eve: 128.3, morn: 105.9 },
      pressure: 1015,
      humidity: 25,
      dew_point: 72.3,
      wind_speed: 3.2,
      wind_deg: 180,
      weather: [
        { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' },
      ],
      clouds: 0,
      pop: 0.0,
      uvi: 11.5,
    },
    'clear'
  ),
}

/**
 * Extreme cold scenario - 4 days of very cold weather
 */
export const extremeCold: WeatherApiData = {
  lat: 40.7128,
  lon: -74.006,
  timezone: 'America/New_York',
  timezone_offset: -18000,
  current: {
    ...clearSunnyDay.current,
    temp: -15.2,
    feels_like: -25.8,
    humidity: 45,
    dew_point: -18.7,
    wind_speed: 18.5,
    weather: [
      {
        id: 602,
        main: 'Snow',
        description: 'heavy snow',
        icon: '13d',
      },
    ],
  },
  daily: generateFourDayForecast(
    {
      dt: 1640995200,
      sunrise: 1640966400,
      sunset: 1641002400,
      moon_phase: 0.75,
      temp: {
        day: -15.2,
        min: -28.5,
        max: -8.1,
        night: -22.3,
        eve: -12.7,
        morn: -25.4,
      },
      feels_like: { day: -25.8, night: -35.2, eve: -20.1, morn: -32.7 },
      pressure: 1025,
      humidity: 45,
      dew_point: -18.7,
      wind_speed: 18.5,
      wind_deg: 315,
      weather: [
        { id: 602, main: 'Snow', description: 'heavy snow', icon: '13d' },
      ],
      clouds: 95,
      pop: 0.9,
      snow: 12.3,
      uvi: 1.2,
    },
    'snowy'
  ),
}

/**
 * Multi-day forecast scenario - 4 days with mixed weather
 */
export const multiDayForecast: WeatherApiData = {
  lat: 40.7128,
  lon: -74.006,
  timezone: 'America/New_York',
  timezone_offset: -18000,
  current: clearSunnyDay.current,
  daily: generateFourDayForecast(
    {
      dt: 1640995200,
      sunrise: 1640966400,
      sunset: 1641002400,
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
    'mixed'
  ),
}

/**
 * Missing moon data scenario - 4 days with no moonrise/moonset
 */
export const missingMoonData: WeatherApiData = {
  ...clearSunnyDay,
  daily: clearSunnyDay.daily.map(day => ({
    ...day,
  })),
}

/**
 * Null values scenario - 4 days with some null/undefined values
 */
export const nullValuesScenario: WeatherApiData = {
  ...clearSunnyDay,
  current: {
    ...clearSunnyDay.current,
    wind_gust: undefined,
  },
  daily: clearSunnyDay.daily.map(day => ({
    ...day,
    rain: undefined as any,
    snow: undefined as any,
    wind_gust: null as any,
  })),
}

/**
 * Minimal response - This should NEVER be used in real scenarios
 * but exists for testing insufficient data error handling
 */
export const minimalResponse: WeatherApiData = {
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
  daily: [], // Empty daily array - should trigger error
}

/**
 * Insufficient forecast data - Only 2 days instead of required 4
 */
export const insufficientForecastData: WeatherApiData = {
  ...clearSunnyDay,
  daily: clearSunnyDay.daily.slice(0, 2), // Only 2 days - should trigger error
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
  multiDayForecast,
  missingMoonData,
  nullValuesScenario,
  minimalResponse,
  insufficientForecastData,
}

/**
 * Helper function to get a scenario by name
 */
export function getWeatherScenario(
  scenarioName: keyof typeof weatherScenarios
): WeatherApiData {
  return weatherScenarios[scenarioName]
}

/**
 * Helper function to create custom scenario variations
 */
export function createCustomScenario(
  baseScenario: WeatherApiData,
  overrides: Partial<WeatherApiData>
): WeatherApiData {
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
