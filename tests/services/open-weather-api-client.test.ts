/**
 * OpenWeatherApiClient Unit Tests
 *
 * Comprehensive tests for OpenWeatherApiClient functionality including:
 * - API URL construction
 * - Successful API calls with proper data validation
 * - Error handling for network failures and invalid responses
 */

import type { Mock } from 'vitest'
import type { WeatherServiceConfig } from '../../src/types/service-config.types'
import { OpenWeatherApiClient } from '../../src/services/open-weather-api-client'
import { getWeatherScenario, OpenWeatherMapMock } from '../__mocks__'

describe('openWeatherApiClient', () => {
  let apiClient: OpenWeatherApiClient
  let testConfig: WeatherServiceConfig

  beforeEach(() => {
    testConfig = {
      apiKey: 'test-api-key',
      latitude: '40.7128',
      longitude: '-74.0060',
      units: 'imperial' as const,
      language: 'en',
    }
    apiClient = new OpenWeatherApiClient(testConfig)
    OpenWeatherMapMock.setup()
  })

  afterEach(() => {
    OpenWeatherMapMock.teardown()
    OpenWeatherMapMock.reset()
  })

  describe('constructor and Configuration', () => {
    it('should initialize with provided configuration', () => {
      const config = apiClient.getConfig()

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
      const customClient = new OpenWeatherApiClient(customConfig)
      const config = customClient.getConfig()

      expect(config.apiKey).toBe('custom-key')
      expect(config.latitude).toBe('51.5074')
      expect(config.longitude).toBe('-0.1278')
      expect(config.units).toBe('metric')
      expect(config.language).toBe('fr')
    })

    it('should return a copy of configuration to prevent mutation', () => {
      const config1 = apiClient.getConfig()
      const config2 = apiClient.getConfig()

      expect(config1).toEqual(config2)
      expect(config1).not.toBe(config2) // Different object references
    })
  })

  describe('aPI URL Construction', () => {
    it('should build correct API URL with all parameters', async () => {
      OpenWeatherMapMock.mockSuccess()

      await apiClient.fetchWeatherData()

      // Verify the fetch was called and check the URL contains expected parts
      expect(globalThis.fetch).toHaveBeenCalledTimes(1)
      const fetchCall = (globalThis.fetch as Mock).mock.calls[0]![0]

      expect(fetchCall).toContain(
        'https://api.openweathermap.org/data/3.0/onecall',
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
      const customClient = new OpenWeatherApiClient(customConfig)
      OpenWeatherMapMock.mockSuccess()

      await customClient.fetchWeatherData()

      // Verify the fetch was called and check the URL contains expected parts
      expect(globalThis.fetch).toHaveBeenCalledTimes(1)
      const fetchCall = (globalThis.fetch as Mock).mock.calls[0]![0]

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
      const clientWithoutLanguage = new OpenWeatherApiClient(
        configWithoutLanguage,
      )
      OpenWeatherMapMock.mockSuccess()

      await clientWithoutLanguage.fetchWeatherData()

      // Verify the fetch was called and check the URL does not contain lang parameter
      expect(globalThis.fetch).toHaveBeenCalledTimes(1)
      const fetchCall = (globalThis.fetch as Mock).mock.calls[0]![0]

      expect(fetchCall).not.toContain('lang=')
    })
  })

  describe('successful API Calls', () => {
    it('should fetch and return valid weather data', async () => {
      const mockData = getWeatherScenario('clearSunnyDay')
      OpenWeatherMapMock.mockSuccess(mockData)

      const result = await apiClient.fetchWeatherData()

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

        const result = await apiClient.fetchWeatherData()

        expect(result.current.weather).toBeDefined()
        expect(result.current.weather[0]!.main).toBeDefined()
        expect(result.daily[0]!.weather[0]!.main).toBeDefined()

        OpenWeatherMapMock.reset()
      }
    })
  })

  describe('error Handling', () => {
    it('should handle HTTP 401 Unauthorized errors', async () => {
      OpenWeatherMapMock.mockError('unauthorized')

      await expect(apiClient.fetchWeatherData()).rejects.toThrow(
        'API Error 401: Invalid API key',
      )
    })

    it('should handle HTTP 404 Not Found errors', async () => {
      OpenWeatherMapMock.mockError('notFound')

      await expect(apiClient.fetchWeatherData()).rejects.toThrow(
        'API Error 404: city not found',
      )
    })

    it('should handle HTTP 429 Rate Limiting errors', async () => {
      OpenWeatherMapMock.mockError('rateLimited')

      await expect(apiClient.fetchWeatherData()).rejects.toThrow(
        'API Error 429:',
      )
    })

    it('should handle HTTP 500 Server errors', async () => {
      OpenWeatherMapMock.mockError('serverError')

      await expect(apiClient.fetchWeatherData()).rejects.toThrow(
        'API Error 500: Internal server error',
      )
    })

    it('should handle network failures', async () => {
      OpenWeatherMapMock.mockNetworkFailure()

      await expect(apiClient.fetchWeatherData()).rejects.toThrow(
        'Network error: Unable to connect to weather service',
      )
    })

    it('should handle invalid JSON responses', async () => {
      OpenWeatherMapMock.mockError('invalidJson')

      await expect(apiClient.fetchWeatherData()).rejects.toThrow()
    })

    it('should handle HTTP errors with non-JSON response body', async () => {
      OpenWeatherMapMock.mockError('errorWithInvalidJson')

      await expect(apiClient.fetchWeatherData()).rejects.toThrow(
        OpenWeatherApiClient.Errors.httpError(503, 'Service Unavailable'),
      )
    })

    it('should handle missing required data fields', async () => {
      const invalidData = {
        lat: 40.7128,
        lon: -74.006,
        // missing timezone and other required fields
      }
      OpenWeatherMapMock.mockSuccess(invalidData as any)

      await expect(apiClient.fetchWeatherData()).rejects.toThrow()
    })

    it('should handle empty daily forecast data', async () => {
      const dataWithEmptyDaily = {
        lat: 40.7128,
        lon: -74.006,
        timezone: 'America/New_York',
        timezone_offset: -18000,
        current: getWeatherScenario('clearSunnyDay').current,
        daily: [],
      }
      OpenWeatherMapMock.mockSuccess(dataWithEmptyDaily)

      await expect(apiClient.fetchWeatherData()).rejects.toThrow()
    })

    it('should handle malformed daily array', async () => {
      const dataWithMalformedDaily = {
        lat: 40.7128,
        lon: -74.006,
        timezone: 'America/New_York',
        timezone_offset: -18000,
        current: getWeatherScenario('clearSunnyDay').current,
        daily: 'not-an-array',
      }
      OpenWeatherMapMock.mockSuccess(dataWithMalformedDaily as any)

      await expect(apiClient.fetchWeatherData()).rejects.toThrow()
    })

    it('should handle insufficient daily forecast data (less than 4 days)', async () => {
      const mockData = getWeatherScenario('clearSunnyDay')
      const dataWithInsufficientDays = {
        ...mockData,
        daily: mockData.daily.slice(0, 2), // Only 2 days instead of required 4
      }
      OpenWeatherMapMock.mockSuccess(dataWithInsufficientDays)

      await expect(apiClient.fetchWeatherData()).rejects.toThrow()
    })
  })
})
