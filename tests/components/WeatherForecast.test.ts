/**
 * WeatherForecast Component Tests
 *
 * Comprehensive tests for WeatherForecast component including:
 * - Forecast list generation
 * - Correct number of forecast days
 * - Proper date formatting for each day
 * - DOM manipulation and error handling
 */

import { WeatherForecast } from '../../src/components/Weather/WeatherForecast'
import { WeatherService } from '../../src/services/WeatherService'
import type { ProcessedWeatherData } from '../../src/types/weather.types'

// Mock DOM container
const mockForecastContainer = document.createElement('div')
mockForecastContainer.id = 'forecast'

// Mock document.getElementById
const mockGetElementById = jest.fn((id: string): HTMLElement | null => {
  if (id === 'forecast') return mockForecastContainer
  return null
})

// Mock WeatherService
const mockWeatherService = {
  mapIconCodeToSVG: jest.fn((iconCode: string) => `icon-${iconCode}`),
} as unknown as WeatherService

// Mock document.createElement to track element creation
const originalCreateElement = document.createElement.bind(document)
const mockCreateElement = jest.fn(originalCreateElement)

describe('WeatherForecast', () => {
  let weatherForecast: WeatherForecast

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock document methods
    jest
      .spyOn(document, 'getElementById')
      .mockImplementation(mockGetElementById)
    jest.spyOn(document, 'createElement').mockImplementation(mockCreateElement)

    // Clear container
    mockForecastContainer.innerHTML = ''

    // Create WeatherForecast instance
    weatherForecast = new WeatherForecast(mockWeatherService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with forecast container element', () => {
      expect(document.getElementById).toHaveBeenCalledWith('forecast')
    })

    it('should handle missing forecast container', () => {
      mockGetElementById.mockReturnValue(null)

      expect(() => {
        new WeatherForecast(mockWeatherService)
      }).not.toThrow()
    })
  })

  describe('updateForecast', () => {
    const mockForecastData: ProcessedWeatherData['forecast'] = [
      {
        dayName: 'Mon',
        iconCode: '01d',
        description: 'Clear sky',
        maxTemp: 78.5,
        minTemp: 65.2,
        date: new Date('2024-01-01'),
      },
      {
        dayName: 'Tue',
        iconCode: '02d',
        description: 'Partly cloudy',
        maxTemp: 75.8,
        minTemp: 62.1,
        date: new Date('2024-01-02'),
      },
      {
        dayName: 'Wed',
        iconCode: '10d',
        description: 'Light rain',
        maxTemp: 68.9,
        minTemp: 58.4,
        date: new Date('2024-01-03'),
      },
    ]

    it('should create forecast day elements correctly', () => {
      // Ensure container exists
      expect(mockForecastContainer).toBeTruthy()

      weatherForecast.updateForecast(mockForecastData)

      // Check that elements were created
      expect(document.createElement).toHaveBeenCalledWith('div')

      // Check container content
      const forecastDays =
        mockForecastContainer.querySelectorAll('.forecast-day')
      expect(forecastDays).toHaveLength(3)

      // Check first day content
      const firstDay = forecastDays[0] as HTMLElement
      expect(firstDay.querySelector('.forecast-day-name')?.textContent).toBe(
        'Mon'
      )
      expect(firstDay.querySelector('.forecast-desc')?.textContent).toBe(
        'Clear sky'
      )
      expect(firstDay.querySelector('.forecast-range')?.textContent).toBe(
        '79° / 65°'
      )

      // Check icon setup
      const icon = firstDay.querySelector('.forecast-icon') as HTMLObjectElement
      expect(icon.tagName.toLowerCase()).toBe('object')
      expect(icon.getAttribute('data')).toBe('weather-icons/icon-01d.svg')
      expect(icon.getAttribute('type')).toBe('image/svg+xml')
    })

    it('should handle different weather conditions', () => {
      const variedForecast: ProcessedWeatherData['forecast'] = [
        {
          dayName: 'Thu',
          iconCode: '11n',
          description: 'Thunderstorm',
          maxTemp: 82.1,
          minTemp: 71.6,
          date: new Date('2024-01-04'),
        },
        {
          dayName: 'Fri',
          iconCode: '13d',
          description: 'Snow',
          maxTemp: 25.3,
          minTemp: 18.9,
          date: new Date('2024-01-05'),
        },
      ]

      weatherForecast.updateForecast(variedForecast)

      const forecastDays =
        mockForecastContainer.querySelectorAll('.forecast-day')
      expect(forecastDays).toHaveLength(2)

      // Check thunderstorm day
      const thunderstormDay = forecastDays[0] as HTMLElement
      expect(
        thunderstormDay.querySelector('.forecast-day-name')?.textContent
      ).toBe('Thu')
      expect(thunderstormDay.querySelector('.forecast-desc')?.textContent).toBe(
        'Thunderstorm'
      )
      expect(
        thunderstormDay.querySelector('.forecast-range')?.textContent
      ).toBe('82° / 72°')

      // Check snow day
      const snowDay = forecastDays[1] as HTMLElement
      expect(snowDay.querySelector('.forecast-day-name')?.textContent).toBe(
        'Fri'
      )
      expect(snowDay.querySelector('.forecast-desc')?.textContent).toBe('Snow')
      expect(snowDay.querySelector('.forecast-range')?.textContent).toBe(
        '25° / 19°'
      )
    })

    it('should limit forecast to 3 days maximum', () => {
      const longForecast: ProcessedWeatherData['forecast'] = [
        ...mockForecastData,
        {
          dayName: 'Thu',
          iconCode: '01d',
          description: 'Clear',
          maxTemp: 80,
          minTemp: 65,
          date: new Date('2024-01-04'),
        },
        {
          dayName: 'Fri',
          iconCode: '02d',
          description: 'Cloudy',
          maxTemp: 75,
          minTemp: 60,
          date: new Date('2024-01-06'),
        },
      ]

      weatherForecast.updateForecast(longForecast)

      const forecastDays =
        mockForecastContainer.querySelectorAll('.forecast-day')
      expect(forecastDays).toHaveLength(3)

      // Should show only first 3 days
      expect(
        forecastDays[0].querySelector('.forecast-day-name')?.textContent
      ).toBe('Mon')
      expect(
        forecastDays[1].querySelector('.forecast-day-name')?.textContent
      ).toBe('Tue')
      expect(
        forecastDays[2].querySelector('.forecast-day-name')?.textContent
      ).toBe('Wed')
    })

    it('should clear existing forecast before updating', () => {
      // Add some existing content
      mockForecastContainer.innerHTML =
        '<div class="old-content">Old forecast</div>'

      weatherForecast.updateForecast(mockForecastData)

      // Old content should be gone
      expect(mockForecastContainer.querySelector('.old-content')).toBeNull()

      // New content should be present
      const forecastDays =
        mockForecastContainer.querySelectorAll('.forecast-day')
      expect(forecastDays).toHaveLength(3)
    })

    it('should handle missing forecast container gracefully', () => {
      // Create instance with missing container
      mockGetElementById.mockReturnValue(null)
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const forecastWithoutContainer = new WeatherForecast(mockWeatherService)
      forecastWithoutContainer.updateForecast(mockForecastData)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Forecast container element not found'
      )

      consoleSpy.mockRestore()
    })
  })

  describe('data validation', () => {
    it('should validate forecast data array', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Test non-array input
      weatherForecast.updateForecast(null as any)

      expect(consoleSpy).toHaveBeenCalledWith('Forecast data is not an array')

      // Should show error state
      expect(
        mockForecastContainer.querySelector('.forecast-error')
      ).toBeTruthy()

      consoleSpy.mockRestore()
    })

    it('should handle empty forecast array', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      weatherForecast.updateForecast([])

      expect(consoleSpy).toHaveBeenCalledWith('Forecast data is empty')
      expect(
        mockForecastContainer.querySelector('.forecast-error')
      ).toBeTruthy()

      consoleSpy.mockRestore()
    })

    it('should validate individual forecast day properties', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const invalidForecast = [
        {
          dayName: '', // Invalid - empty string
          iconCode: '01d',
          description: 'Clear',
          maxTemp: 75,
          minTemp: 65,
        },
      ] as ProcessedWeatherData['forecast']

      weatherForecast.updateForecast(invalidForecast)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid forecast day data:',
        expect.any(Object)
      )
      expect(
        mockForecastContainer.querySelector('.forecast-error')
      ).toBeTruthy()

      consoleSpy.mockRestore()
    })

    it('should validate temperature properties are numbers', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const invalidTempForecast = [
        {
          dayName: 'Mon',
          iconCode: '01d',
          description: 'Clear',
          maxTemp: 'hot' as any, // Invalid - not a number
          minTemp: 65,
        },
      ] as ProcessedWeatherData['forecast']

      weatherForecast.updateForecast(invalidTempForecast)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid forecast day data:',
        expect.any(Object)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('error handling', () => {
    it('should show error state when validation fails', () => {
      weatherForecast.updateForecast([])

      const errorElement =
        mockForecastContainer.querySelector('.forecast-error')
      expect(errorElement).toBeTruthy()
      expect(errorElement?.textContent).toBe('Forecast data unavailable')
    })

    it('should show error state when update throws exception', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Mock createElement to throw an error
      mockCreateElement.mockImplementation(() => {
        throw new Error('DOM manipulation failed')
      })

      weatherForecast.updateForecast([
        {
          dayName: 'Mon',
          iconCode: '01d',
          description: 'Clear',
          maxTemp: 75,
          minTemp: 65,
          date: new Date('2024-01-01'),
        },
      ])

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error updating forecast display:',
        expect.any(Error)
      )
      expect(
        mockForecastContainer.querySelector('.forecast-error')
      ).toBeTruthy()

      consoleSpy.mockRestore()
    })

    it('should handle error state with missing container', () => {
      mockGetElementById.mockReturnValue(null)
      const forecastWithoutContainer = new WeatherForecast(mockWeatherService)

      // Should not throw when trying to show error state
      expect(() => {
        forecastWithoutContainer['showErrorState']()
      }).not.toThrow()
    })
  })

  describe('container management', () => {
    it('should refresh container reference when requested', () => {
      const spy = jest.spyOn(document, 'getElementById')
      spy.mockClear()

      weatherForecast.refreshContainer()

      expect(spy).toHaveBeenCalledWith('forecast')
    })

    it('should get correct forecast day count', () => {
      // Initially empty
      expect(weatherForecast.getForecastDayCount()).toBe(0)

      // After adding forecast
      weatherForecast.updateForecast(mockForecastData)
      expect(weatherForecast.getForecastDayCount()).toBe(3)

      // After clearing
      weatherForecast['clearForecast']()
      expect(weatherForecast.getForecastDayCount()).toBe(0)
    })

    it('should handle forecast day count with missing container', () => {
      mockGetElementById.mockReturnValue(null)
      const forecastWithoutContainer = new WeatherForecast(mockWeatherService)

      expect(forecastWithoutContainer.getForecastDayCount()).toBe(0)
    })
  })

  describe('HTML structure generation', () => {
    it('should create correct HTML structure for forecast days', () => {
      const singleDayForecast: ProcessedWeatherData['forecast'] = [
        {
          dayName: 'Sat',
          iconCode: '50d',
          description: 'Mist',
          maxTemp: 72.8,
          minTemp: 68.1,
          date: new Date('2024-01-06'),
        },
      ]

      weatherForecast.updateForecast(singleDayForecast)

      const forecastDay = mockForecastContainer.querySelector(
        '.forecast-day'
      ) as HTMLElement
      expect(forecastDay).toBeTruthy()

      // Check all required child elements exist
      expect(forecastDay.querySelector('.forecast-day-name')).toBeTruthy()
      expect(forecastDay.querySelector('.forecast-icon')).toBeTruthy()
      expect(forecastDay.querySelector('.forecast-desc')).toBeTruthy()
      expect(forecastDay.querySelector('.forecast-range')).toBeTruthy()

      // Check icon attributes
      const icon = forecastDay.querySelector(
        '.forecast-icon'
      ) as HTMLObjectElement
      expect(icon.tagName.toLowerCase()).toBe('object')
      expect(icon.getAttribute('type')).toBe('image/svg+xml')
      expect(icon.getAttribute('data')).toBe('weather-icons/icon-50d.svg')
      expect(icon.classList.contains('forecast-icon')).toBe(true)
    })

    it('should apply correct CSS classes', () => {
      weatherForecast.updateForecast([
        {
          dayName: 'Sun',
          iconCode: '02n',
          description: 'Few clouds',
          maxTemp: 70,
          minTemp: 60,
          date: new Date('2024-01-07'),
        },
      ])

      const forecastDay = mockForecastContainer.querySelector(
        '.forecast-day'
      ) as HTMLElement
      expect(forecastDay.classList.contains('forecast-day')).toBe(true)

      const dayName = forecastDay.querySelector('.forecast-day-name')
      expect(dayName?.classList.contains('forecast-day-name')).toBe(true)

      const icon = forecastDay.querySelector('.forecast-icon')
      expect(icon?.classList.contains('forecast-icon')).toBe(true)

      const desc = forecastDay.querySelector('.forecast-desc')
      expect(desc?.classList.contains('forecast-desc')).toBe(true)

      const range = forecastDay.querySelector('.forecast-range')
      expect(range?.classList.contains('forecast-range')).toBe(true)
    })
  })

  describe('temperature formatting', () => {
    it('should format temperature ranges correctly', () => {
      const preciseTemps: ProcessedWeatherData['forecast'] = [
        {
          dayName: 'Mon',
          iconCode: '01d',
          description: 'Clear',
          maxTemp: 78.7,
          minTemp: 65.3,
          date: new Date('2024-01-01'),
        },
      ]

      weatherForecast.updateForecast(preciseTemps)

      const range = mockForecastContainer.querySelector('.forecast-range')
      expect(range?.textContent).toBe('79° / 65°')
    })

    it('should handle negative temperatures', () => {
      const coldForecast: ProcessedWeatherData['forecast'] = [
        {
          dayName: 'Mon',
          iconCode: '13d',
          description: 'Snow',
          maxTemp: -5.2,
          minTemp: -12.8,
          date: new Date('2024-01-01'),
        },
      ]

      weatherForecast.updateForecast(coldForecast)

      const range = mockForecastContainer.querySelector('.forecast-range')
      expect(range?.textContent).toBe('-5° / -13°')
    })
  })

  describe('icon mapping integration', () => {
    it('should call weather service for icon mapping', () => {
      const iconTestForecast: ProcessedWeatherData['forecast'] = [
        {
          dayName: 'Mon',
          iconCode: '11d',
          description: 'Thunderstorm',
          maxTemp: 75,
          minTemp: 65,
          date: new Date('2024-01-01'),
        },
      ]

      weatherForecast.updateForecast(iconTestForecast)

      expect(mockWeatherService.mapIconCodeToSVG).toHaveBeenCalledWith('11d')

      const icon = mockForecastContainer.querySelector(
        '.forecast-icon'
      ) as HTMLObjectElement
      expect(icon.getAttribute('data')).toBe('weather-icons/icon-11d.svg')
    })

    it('should handle multiple different icon codes', () => {
      const multiIconForecast: ProcessedWeatherData['forecast'] = [
        {
          dayName: 'Mon',
          iconCode: '01d',
          description: 'Clear',
          maxTemp: 75,
          minTemp: 65,
          date: new Date('2024-01-01'),
        },
        {
          dayName: 'Tue',
          iconCode: '10n',
          description: 'Rain',
          maxTemp: 70,
          minTemp: 60,
          date: new Date('2024-01-02'),
        },
        {
          dayName: 'Wed',
          iconCode: '50d',
          description: 'Fog',
          maxTemp: 68,
          minTemp: 58,
          date: new Date('2024-01-03'),
        },
      ]

      weatherForecast.updateForecast(multiIconForecast)

      expect(mockWeatherService.mapIconCodeToSVG).toHaveBeenCalledWith('01d')
      expect(mockWeatherService.mapIconCodeToSVG).toHaveBeenCalledWith('10n')
      expect(mockWeatherService.mapIconCodeToSVG).toHaveBeenCalledWith('50d')

      const icons = mockForecastContainer.querySelectorAll('.forecast-icon')
      expect((icons[0] as HTMLObjectElement).getAttribute('data')).toBe(
        'weather-icons/icon-01d.svg'
      )
      expect((icons[1] as HTMLObjectElement).getAttribute('data')).toBe(
        'weather-icons/icon-10n.svg'
      )
      expect((icons[2] as HTMLObjectElement).getAttribute('data')).toBe(
        'weather-icons/icon-50d.svg'
      )
    })
  })
})
