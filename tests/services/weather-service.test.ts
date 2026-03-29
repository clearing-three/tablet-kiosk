/**
 * WeatherService Integration Tests
 *
 * Tests for WeatherService orchestration of API client and data processor.
 */

import type { WeatherServiceConfig } from '../../src/types/service-config.types'
import { WeatherService } from '../../src/services/weather-service'
import { getWeatherScenario, OpenWeatherMapMock } from '../__mocks__'

describe('weatherService', () => {
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

  describe('constructor and Configuration', () => {
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

  describe('integration - Fetch and Process', () => {
    it('should get processed weather data in one call', async () => {
      const mockData = getWeatherScenario('multiDayForecast')
      OpenWeatherMapMock.mockSuccess(mockData)

      const result = await weatherService.getWeatherData()

      expect(result.current).toBeDefined()
      expect(result.forecast).toHaveLength(2)
      expect(result.astronomy).toBeDefined()
    })

    it('should maintain data integrity through the full pipeline', async () => {
      const originalData = getWeatherScenario('clearSunnyDay')
      OpenWeatherMapMock.mockSuccess(originalData)

      const processedData = await weatherService.getWeatherData()

      // Verify that original timestamps are preserved in astronomy data
      expect(processedData.astronomy.sunrise).toBe(originalData.current.sunrise)
      expect(processedData.astronomy.sunset).toBe(originalData.current.sunset)

      // Verify processing applied correctly
      expect(processedData.current.temperature).toBe(
        Math.round(originalData.current.temp),
      )
    })

    it('should handle API errors during fetch', async () => {
      OpenWeatherMapMock.mockError('unauthorized')

      await expect(weatherService.getWeatherData()).rejects.toThrow(
        'API Error 401',
      )
    })

    it('should handle network failures during fetch', async () => {
      OpenWeatherMapMock.mockNetworkFailure()

      await expect(weatherService.getWeatherData()).rejects.toThrow(
        'Network error',
      )
    })

    it('should process icon codes internally and not expose provider details', async () => {
      const mockData = getWeatherScenario('clearSunnyDay')
      OpenWeatherMapMock.mockSuccess(mockData)

      const result = await weatherService.getWeatherData()

      // Icons should be mapped to standard names, not raw provider codes
      expect(result.current.icon).toBeDefined()
      expect(typeof result.current.icon).toBe('string')
      expect(result.current.icon).not.toMatch(/^\d{2}[dn]$/) // Should not be OWM format

      result.forecast.forEach((day) => {
        expect(day.icon).toBeDefined()
        expect(typeof day.icon).toBe('string')
        expect(day.icon).not.toMatch(/^\d{2}[dn]$/)
      })
    })
  })
})
