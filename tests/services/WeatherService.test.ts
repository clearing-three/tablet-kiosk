/**
 * WeatherService Unit Tests
 *
 * Comprehensive tests for WeatherService functionality including:
 * - API URL construction
 * - Successful API calls with proper data transformation
 * - Error handling for network failures and invalid responses
 * - Data processing and validation
 */

import type { Mock } from 'vitest'
import { WeatherService } from '../../src/services/WeatherService'
import type { WeatherServiceConfig } from '../../src/types/service-config.types'
import {
  REQUIRED_FORECAST_DAYS,
  DISPLAY_FORECAST_DAYS,
} from '../../src/constants/weather.constants'
import {
  OpenWeatherMapMock,
  weatherScenarios,
  getWeatherScenario,
} from '../__mocks__'

describe('WeatherService', () => {
  let weatherService: WeatherService
  let testConfig: WeatherServiceConfig

  beforeEach(() => {
    testConfig = {
      apiKey: 'test-api-key',
      latitude: '40.7128',
      longitude: '-74.0060',
      units: 'imperial' as const,
      language: 'en',
    }
    weatherService = new WeatherService(testConfig)
    OpenWeatherMapMock.setup()
  })

  afterEach(() => {
    OpenWeatherMapMock.teardown()
    OpenWeatherMapMock.reset()
  })

  describe('Constructor and Configuration', () => {
    it('should initialize with provided configuration', () => {
      const config = weatherService.getConfig()

      expect(config.apiKey).toBe('test-api-key')
      expect(config.latitude).toBe('40.7128')
      expect(config.longitude).toBe('-74.0060')
      expect(config.units).toBe('imperial')
      expect(config.language).toBe('en')
    })

    it('should accept different configuration values', () => {
      const customConfig: WeatherServiceConfig = {
        apiKey: 'custom-key',
        latitude: '51.5074',
        longitude: '-0.1278',
        units: 'metric',
        language: 'fr',
      }
      const customService = new WeatherService(customConfig)
      const config = customService.getConfig()

      expect(config.apiKey).toBe('custom-key')
      expect(config.latitude).toBe('51.5074')
      expect(config.longitude).toBe('-0.1278')
      expect(config.units).toBe('metric')
      expect(config.language).toBe('fr')
    })

    it('should return a copy of configuration to prevent mutation', () => {
      const config1 = weatherService.getConfig()
      const config2 = weatherService.getConfig()

      expect(config1).toEqual(config2)
      expect(config1).not.toBe(config2) // Different object references
    })
  })

  describe('API URL Construction', () => {
    it('should build correct API URL with all parameters', async () => {
      OpenWeatherMapMock.mockSuccess()

      await weatherService.fetchWeatherData()

      // Verify the fetch was called and check the URL contains expected parts
      expect(global.fetch).toHaveBeenCalledTimes(1)
      const fetchCall = (global.fetch as Mock).mock.calls[0][0]

      expect(fetchCall).toContain(
        'https://api.openweathermap.org/data/3.0/onecall'
      )
      expect(fetchCall).toContain('lat=40.7128')
      expect(fetchCall).toContain('lon=-74.0060')
      expect(fetchCall).toContain('units=imperial')
      expect(fetchCall).toContain('exclude=minutely%2Chourly%2Calerts')
      expect(fetchCall).toContain('appid=test-api-key')
      expect(fetchCall).toContain('lang=en')
    })

    it('should build URL with different configuration values', async () => {
      const customConfig: WeatherServiceConfig = {
        apiKey: 'different-key',
        latitude: '51.5074',
        longitude: '-0.1278',
        units: 'metric',
        language: 'fr',
      }
      const customService = new WeatherService(customConfig)
      OpenWeatherMapMock.mockSuccess()

      await customService.fetchWeatherData()

      // Verify the fetch was called and check the URL contains expected parts
      expect(global.fetch).toHaveBeenCalledTimes(1)
      const fetchCall = (global.fetch as Mock).mock.calls[0][0]

      expect(fetchCall).toContain('lat=51.5074')
      expect(fetchCall).toContain('lon=-0.1278')
      expect(fetchCall).toContain('units=metric')
      expect(fetchCall).toContain('appid=different-key')
      expect(fetchCall).toContain('lang=fr')
    })

    it('should build URL without language parameter when not provided', async () => {
      const configWithoutLanguage: WeatherServiceConfig = {
        apiKey: 'test-key',
        latitude: '40.7128',
        longitude: '-74.0060',
        units: 'imperial',
      }
      const serviceWithoutLanguage = new WeatherService(configWithoutLanguage)
      OpenWeatherMapMock.mockSuccess()

      await serviceWithoutLanguage.fetchWeatherData()

      // Verify the fetch was called and check the URL does not contain lang parameter
      expect(global.fetch).toHaveBeenCalledTimes(1)
      const fetchCall = (global.fetch as Mock).mock.calls[0][0]

      expect(fetchCall).not.toContain('lang=')
    })
  })

  describe('Successful API Calls', () => {
    it('should fetch and return valid weather data', async () => {
      const mockData = getWeatherScenario('clearSunnyDay')
      OpenWeatherMapMock.mockSuccess(mockData)

      const result = await weatherService.fetchWeatherData()

      expect(result).toEqual(mockData)
      expect(result.current).toBeDefined()
      expect(result.daily).toBeDefined()
      expect(Array.isArray(result.daily)).toBe(true)
      expect(result.daily.length).toBeGreaterThan(0)
    })

    it('should handle different weather scenarios', async () => {
      const scenarios = [
        'clearSunnyDay',
        'rainyStormyDay',
        'snowyWinterDay',
      ] as const

      for (const scenarioName of scenarios) {
        const scenario = getWeatherScenario(scenarioName)
        OpenWeatherMapMock.mockSuccess(scenario)

        const result = await weatherService.fetchWeatherData()

        expect(result.current.weather).toBeDefined()
        expect(result.current.weather[0].main).toBeDefined()
        expect(result.daily[0].weather[0].main).toBeDefined()

        OpenWeatherMapMock.reset()
      }
    })

    it('should process weather data correctly', async () => {
      const mockData = getWeatherScenario('multiDayForecast')
      const processed = weatherService.processWeatherData(mockData)

      // Check current weather processing
      expect(processed.current.temperature).toBe(
        Math.round(mockData.current.temp)
      )
      expect(processed.current.feelsLike).toBe(
        Math.round(mockData.current.feels_like)
      )
      expect(processed.current.description).toBe(
        mockData.current.weather[0].description
      )
      expect(processed.current.iconCode).toBe(mockData.current.weather[0].icon)
      expect(processed.current.minTemp).toBe(
        Math.round(mockData.daily[0].temp.min)
      )
      expect(processed.current.maxTemp).toBe(
        Math.round(mockData.daily[0].temp.max)
      )

      // Check forecast processing (next 3 days, excluding today)
      expect(processed.forecast).toHaveLength(DISPLAY_FORECAST_DAYS)
      processed.forecast.forEach((day, index) => {
        const originalDay = mockData.daily[index + 1] // Skip today
        expect(day.dayName).toBeDefined()
        expect(day.iconCode).toBe(originalDay.weather[0].icon)
        expect(day.description).toBe(originalDay.weather[0].description)
        expect(day.maxTemp).toBe(Math.round(originalDay.temp.max))
        expect(day.minTemp).toBe(Math.round(originalDay.temp.min))
        expect(day.date).toBeInstanceOf(Date)
      })

      // Check astronomy data processing
      expect(processed.astronomy.sunrise).toBe(mockData.current.sunrise)
      expect(processed.astronomy.sunset).toBe(mockData.current.sunset)
      expect(processed.astronomy.moonrise).toBe(mockData.daily[0].moonrise)
      expect(processed.astronomy.moonset).toBe(mockData.daily[0].moonset)
      expect(processed.astronomy.moonPhase).toBe(mockData.daily[0].moon_phase)
    })

    it('should get processed weather data in one call', async () => {
      const mockData = getWeatherScenario('multiDayForecast')
      OpenWeatherMapMock.mockSuccess(mockData)

      const result = await weatherService.getProcessedWeatherData()

      expect(result.current).toBeDefined()
      expect(result.forecast).toHaveLength(DISPLAY_FORECAST_DAYS)
      expect(result.astronomy).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle HTTP 401 Unauthorized errors', async () => {
      OpenWeatherMapMock.mockError('unauthorized')

      await expect(weatherService.fetchWeatherData()).rejects.toThrow(
        'API Error 401: Invalid API key'
      )
    })

    it('should handle HTTP 404 Not Found errors', async () => {
      OpenWeatherMapMock.mockError('notFound')

      await expect(weatherService.fetchWeatherData()).rejects.toThrow(
        'API Error 404: city not found'
      )
    })

    it('should handle HTTP 429 Rate Limiting errors', async () => {
      OpenWeatherMapMock.mockError('rateLimited')

      await expect(weatherService.fetchWeatherData()).rejects.toThrow(
        'API Error 429:'
      )
    })

    it('should handle HTTP 500 Server errors', async () => {
      OpenWeatherMapMock.mockError('serverError')

      await expect(weatherService.fetchWeatherData()).rejects.toThrow(
        'API Error 500: Internal server error'
      )
    })

    it('should handle network failures', async () => {
      OpenWeatherMapMock.mockNetworkFailure()

      await expect(weatherService.fetchWeatherData()).rejects.toThrow(
        'Network error: Unable to connect to weather service'
      )
    })

    it('should handle invalid JSON responses', async () => {
      OpenWeatherMapMock.mockError('invalidJson')

      await expect(weatherService.fetchWeatherData()).rejects.toThrow()
    })

    it('should handle missing required data fields', async () => {
      const invalidData = {
        lat: 40.7128,
        lon: -74.006,
        timezone: 'America/New_York',
        timezone_offset: -18000,
        // Missing current and daily fields
      } as any

      OpenWeatherMapMock.mockSuccess(invalidData)

      await expect(weatherService.fetchWeatherData()).rejects.toThrow(
        /Invalid API response.*missing required data fields/i
      )
    })

    it('should handle empty daily forecast data', async () => {
      const dataWithEmptyDaily = {
        ...getWeatherScenario('clearSunnyDay'),
        daily: [],
      }

      OpenWeatherMapMock.mockSuccess(dataWithEmptyDaily)

      await expect(weatherService.fetchWeatherData()).rejects.toThrow(
        /Invalid API response.*no daily forecast data/i
      )
    })

    it('should handle malformed daily array', async () => {
      const dataWithInvalidDaily = {
        ...getWeatherScenario('clearSunnyDay'),
        daily: null as any,
      }

      OpenWeatherMapMock.mockSuccess(dataWithInvalidDaily)

      await expect(weatherService.fetchWeatherData()).rejects.toThrow(
        /Invalid API response.*missing required data fields/i
      )
    })

    it('should handle insufficient daily forecast data (less than 4 days)', async () => {
      OpenWeatherMapMock.mockSuccess(
        getWeatherScenario('insufficientForecastData')
      )

      await expect(weatherService.fetchWeatherData()).rejects.toThrow(
        new RegExp(
          `Invalid API response.*insufficient forecast data.*Expected at least ${REQUIRED_FORECAST_DAYS} days, got 2 days`,
          'i'
        )
      )
    })
  })

  describe('Data Processing Edge Cases', () => {
    it('should handle missing moonrise/moonset data', async () => {
      const dataWithMissingMoon = getWeatherScenario('missingMoonData')
      const processed = weatherService.processWeatherData(dataWithMissingMoon)

      expect(processed.astronomy.moonrise).toBe(0)
      expect(processed.astronomy.moonset).toBe(0)
    })

    it('should handle extreme weather values', async () => {
      const extremeData = getWeatherScenario('extremeHeat')
      const processed = weatherService.processWeatherData(extremeData)

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
            ...getWeatherScenario('clearSunnyDay').daily[0],
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

      const processed = weatherService.processWeatherData(testData)

      expect(processed.current.temperature).toBe(73) // 72.7 rounded
      expect(processed.current.feelsLike).toBe(69) // 69.4 rounded
      expect(processed.current.minTemp).toBe(65) // 65.3 rounded
      expect(processed.current.maxTemp).toBe(79) // 78.9 rounded
    })

    it('should process exactly required days of forecast data correctly', () => {
      const dataWithRequiredDays = getWeatherScenario('clearSunnyDay')

      // Verify we have exactly the required number of days
      expect(dataWithRequiredDays.daily).toHaveLength(REQUIRED_FORECAST_DAYS)

      const processed = weatherService.processWeatherData(dataWithRequiredDays)

      expect(processed.forecast).toHaveLength(DISPLAY_FORECAST_DAYS) // Forecast days (excluding today)
    })

    it('should reject data with insufficient forecast days during processing', () => {
      const dataWithInsufficientDays = {
        ...getWeatherScenario('clearSunnyDay'),
        daily: getWeatherScenario('clearSunnyDay').daily.slice(0, 2), // Only 2 days
      }

      // This should throw when trying to process insufficient data
      expect(() => {
        weatherService.processWeatherData(dataWithInsufficientDays)
      }).toThrow(new RegExp(`Expected at least ${REQUIRED_FORECAST_DAYS} days`))
    })
  })

  describe('Icon Mapping', () => {
    it('should map OpenWeatherMap icon codes to SVG names', () => {
      const testCodes = ['01d', '02n', '10d', '13d', '50n']

      testCodes.forEach(code => {
        const result = weatherService.mapIconCodeToSVG(code)
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      })
    })

    it('should handle unknown icon codes gracefully', () => {
      const unknownCode = 'unknown-code'
      const result = weatherService.mapIconCodeToSVG(unknownCode)

      expect(typeof result).toBe('string')
      // Should return a fallback icon or handle gracefully
    })
  })

  describe('Integration with Mocks', () => {
    it('should work with all valid weather scenario fixtures', () => {
      const scenarios = Object.keys(weatherScenarios) as Array<
        keyof typeof weatherScenarios
      >

      scenarios.forEach(scenarioName => {
        const scenario = getWeatherScenario(scenarioName)

        // Skip scenarios designed to test insufficient data error handling
        if (
          scenarioName === 'minimalResponse' ||
          scenarioName === 'insufficientForecastData'
        ) {
          return
        }

        expect(() => {
          weatherService.processWeatherData(scenario)
        }).not.toThrow()

        // All valid scenarios should now have exactly the required number of days
        expect(scenario.daily).toHaveLength(REQUIRED_FORECAST_DAYS)

        // And should produce exactly the expected number of forecast days
        const processed = weatherService.processWeatherData(scenario)
        expect(processed.forecast).toHaveLength(DISPLAY_FORECAST_DAYS)
      })
    })

    it('should reject scenarios with insufficient forecast data', () => {
      // Test the scenarios specifically designed to have insufficient data
      expect(() => {
        weatherService.processWeatherData(getWeatherScenario('minimalResponse'))
      }).toThrow(/insufficient forecast data/)

      expect(() => {
        weatherService.processWeatherData(
          getWeatherScenario('insufficientForecastData')
        )
      }).toThrow(/insufficient forecast data/)
    })

    it('should maintain data integrity through processing', async () => {
      const originalData = getWeatherScenario('clearSunnyDay')
      OpenWeatherMapMock.mockSuccess(originalData)

      const fetchedData = await weatherService.fetchWeatherData()
      const processedData = weatherService.processWeatherData(fetchedData)

      // Verify that original timestamps are preserved in astronomy data
      expect(processedData.astronomy.sunrise).toBe(originalData.current.sunrise)
      expect(processedData.astronomy.sunset).toBe(originalData.current.sunset)

      // Verify that the processing doesn't mutate the original data
      expect(originalData.current.temp).toBeDefined()
      expect(originalData.daily[0].temp.min).toBeDefined()
    })
  })
})
