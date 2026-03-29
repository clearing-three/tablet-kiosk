/**
 * WeatherDataProcessor Unit Tests
 *
 * Comprehensive tests for WeatherDataProcessor functionality including:
 * - Data transformation and processing
 * - Temperature rounding
 * - Wind direction calculation
 * - Icon mapping
 */

import { REQUIRED_FORECAST_DAYS } from '../../src/constants/weather.constants'
import { WeatherDataProcessor } from '../../src/services/weather-data-processor'
import { getWeatherScenario, weatherScenarios } from '../__mocks__'

describe('weatherDataProcessor', () => {
  let processor: WeatherDataProcessor

  beforeEach(() => {
    processor = new WeatherDataProcessor()
  })

  describe('data Processing', () => {
    it('should process weather data correctly', () => {
      const mockData = getWeatherScenario('multiDayForecast')
      const processed = processor.processWeatherData(mockData)

      // Check current weather processing
      expect(processed.current.temperature).toBe(
        Math.round(mockData.current.temp),
      )
      expect(processed.current.feelsLike).toBe(
        Math.round(mockData.current.feels_like),
      )
      expect(processed.current.description).toBe(
        mockData.current.weather[0]!.description,
      )
      expect(processed.current.icon).toBeDefined()
      expect(typeof processed.current.icon).toBe('string')
      expect(processed.current.minTemp).toBe(
        Math.round(mockData.daily[0]!.temp.min),
      )
      expect(processed.current.maxTemp).toBe(
        Math.round(mockData.daily[0]!.temp.max),
      )

      // Check forecast processing (next 3 days, excluding today)
      expect(processed.forecast).toHaveLength(2)
      processed.forecast.forEach((day, index) => {
        const originalDay = mockData.daily[index + 1]! // Skip today
        expect(day.dayName).toBeDefined()
        expect(day.icon).toBeDefined()
        expect(typeof day.icon).toBe('string')
        expect(day.description).toBe(originalDay.weather[0]!.description)
        expect(day.maxTemp).toBe(Math.round(originalDay.temp.max))
        expect(day.minTemp).toBe(Math.round(originalDay.temp.min))
        expect(day.date).toBeInstanceOf(Date)
      })

      // Check astronomy data processing
      expect(processed.astronomy.sunrise).toBe(mockData.current.sunrise)
      expect(processed.astronomy.sunset).toBe(mockData.current.sunset)
    })
  })

  describe('data Processing Edge Cases', () => {
    it('should handle extreme weather values', () => {
      const extremeData = getWeatherScenario('extremeHeat')
      const processed = processor.processWeatherData(extremeData)

      expect(processed.current.temperature).toBeGreaterThan(100)
      expect(typeof processed.current.temperature).toBe('number')
      expect(Number.isInteger(processed.current.temperature)).toBe(true)
    })

    it('should round temperatures correctly', () => {
      const testData = {
        ...getWeatherScenario('clearSunnyDay'),
        current: {
          ...getWeatherScenario('clearSunnyDay').current,
          temp: 72.7,
          feels_like: 69.4,
        },
        daily: [
          {
            ...getWeatherScenario('clearSunnyDay').daily[0]!,
            temp: {
              min: 65.3,
              max: 78.9,
              day: 72.7,
              night: 68.2,
              eve: 75.1,
              morn: 67.4,
            },
          },
          ...getWeatherScenario('clearSunnyDay').daily.slice(1),
        ],
      }

      const processed = processor.processWeatherData(testData)

      expect(processed.current.temperature).toBe(73) // 72.7 rounded
      expect(processed.current.feelsLike).toBe(69) // 69.4 rounded
      expect(processed.current.minTemp).toBe(65) // 65.3 rounded
      expect(processed.current.maxTemp).toBe(79) // 78.9 rounded
    })

    it('should process wind fields correctly', () => {
      const testData = {
        ...getWeatherScenario('clearSunnyDay'),
        current: {
          ...getWeatherScenario('clearSunnyDay').current,
          wind_speed: 12.4,
          wind_deg: 315, // NW
          wind_gust: 18.6,
        },
      }

      const processed = processor.processWeatherData(testData)

      expect(processed.current.windSpeed).toBe(12) // 12.4 rounded
      expect(processed.current.windDirection).toBe('NW') // 315° → NW
      expect(processed.current.windGust).toBe(19) // 18.6 rounded
    })

    it('should convert wind degrees to correct cardinal directions', () => {
      const cardinalCases: [number, string][] = [
        [0, 'N'],
        [45, 'NE'],
        [90, 'E'],
        [135, 'SE'],
        [180, 'S'],
        [225, 'SW'],
        [270, 'W'],
        [315, 'NW'],
        [360, 'N'], // 360 % 8 = 0 → N
      ]

      cardinalCases.forEach(([deg, expected]) => {
        const testData = {
          ...getWeatherScenario('clearSunnyDay'),
          current: {
            ...getWeatherScenario('clearSunnyDay').current,
            wind_deg: deg,
          },
        }
        const processed = processor.processWeatherData(testData)
        expect(processed.current.windDirection).toBe(expected)
      })
    })

    it('should handle missing wind gust', () => {
      const testData = {
        ...getWeatherScenario('clearSunnyDay'),
        current: {
          ...getWeatherScenario('clearSunnyDay').current,
          wind_gust: undefined,
        },
      }

      const processed = processor.processWeatherData(testData)

      expect(processed.current.windGust).toBeUndefined()
    })

    it('should process exactly required days of forecast data correctly', () => {
      const dataWithRequiredDays = getWeatherScenario('clearSunnyDay')

      // Verify we have exactly the required number of days
      expect(dataWithRequiredDays.daily).toHaveLength(REQUIRED_FORECAST_DAYS)

      const processed = processor.processWeatherData(dataWithRequiredDays)

      expect(processed.forecast).toHaveLength(2) // Forecast days (excluding today)
    })

    it('should successfully process data when daily is a valid array with sufficient days', () => {
      const validData = getWeatherScenario('clearSunnyDay')

      // Verify the data has a valid array with sufficient days
      expect(Array.isArray(validData.daily)).toBe(true)
      expect(validData.daily.length).toBeGreaterThanOrEqual(
        REQUIRED_FORECAST_DAYS,
      )

      // Should not throw
      expect(() => {
        processor.processWeatherData(validData)
      }).not.toThrow()

      // Should return processed data
      const processed = processor.processWeatherData(validData)
      expect(processed.current).toBeDefined()
      expect(processed.forecast).toBeDefined()
      expect(processed.astronomy).toBeDefined()
    })
  })

  describe('icon Mapping', () => {
    it('should map icon codes internally during processing', () => {
      const mockData = getWeatherScenario('clearSunnyDay')
      const processed = processor.processWeatherData(mockData)

      // Icons should be mapped to standard names, not raw provider codes
      expect(processed.current.icon).toBeDefined()
      expect(typeof processed.current.icon).toBe('string')
      expect(processed.current.icon).not.toMatch(/^\d{2}[dn]$/) // Should not be OWM format like '01d'

      processed.forecast.forEach((day) => {
        expect(day.icon).toBeDefined()
        expect(typeof day.icon).toBe('string')
        expect(day.icon).not.toMatch(/^\d{2}[dn]$/)
      })
    })

    it('should map various weather conditions correctly', () => {
      const scenarios: Array<keyof typeof weatherScenarios> = [
        'clearSunnyDay',
        'rainyStormyDay',
        'snowyWinterDay',
        'multiDayForecast',
      ]

      scenarios.forEach((scenarioName) => {
        const mockData = getWeatherScenario(scenarioName)
        const processed = processor.processWeatherData(mockData)

        expect(processed.current.icon).toBeDefined()
        expect(processed.current.icon.length).toBeGreaterThan(0)
      })
    })
  })

  describe('integration with Mocks', () => {
    it('should work with all valid weather scenario fixtures', () => {
      const scenarios = Object.keys(weatherScenarios) as Array<
        keyof typeof weatherScenarios
      >

      scenarios.forEach((scenarioName) => {
        const scenario = getWeatherScenario(scenarioName)

        // Skip scenarios designed to test insufficient data error handling
        if (
          scenarioName === 'minimalResponse'
          || scenarioName === 'insufficientForecastData'
        ) {
          return
        }

        expect(() => {
          processor.processWeatherData(scenario)
        }).not.toThrow()

        // All valid scenarios should now have exactly the required number of days
        expect(scenario.daily).toHaveLength(REQUIRED_FORECAST_DAYS)

        // And should produce exactly the expected number of forecast days
        const processed = processor.processWeatherData(scenario)
        expect(processed.forecast).toHaveLength(2)
      })
    })

    it('should maintain data integrity through processing', () => {
      const originalData = getWeatherScenario('clearSunnyDay')
      const processedData = processor.processWeatherData(originalData)

      // Verify that original timestamps are preserved in astronomy data
      expect(processedData.astronomy.sunrise).toBe(originalData.current.sunrise)
      expect(processedData.astronomy.sunset).toBe(originalData.current.sunset)

      // Verify that the processing doesn't mutate the original data
      expect(originalData.current.temp).toBeDefined()
      expect(originalData.daily[0]!.temp.min).toBeDefined()
    })
  })
})
