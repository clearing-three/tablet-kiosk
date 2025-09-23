/**
 * WeatherDisplay Component Tests
 *
 * Comprehensive tests for WeatherDisplay component including:
 * - DOM updates with weather data
 * - Icon loading and display
 * - Temperature and description rendering
 * - Error state handling
 */

import { WeatherDisplay } from '../../src/components/Weather/WeatherDisplay'
import { WeatherService } from '../../src/services/WeatherService'
import type { ProcessedWeatherData } from '../../src/types/weather.types'

// Mock DOM elements
const mockElements = {
  icon: document.createElement('object') as HTMLObjectElement,
  tempNow: document.createElement('div'),
  description: document.createElement('div'),
  range: document.createElement('div'),
}

// Mock document.getElementById
const mockGetElementById = jest.fn((id: string): HTMLElement | null => {
  const elementMap: Record<string, HTMLElement> = {
    'weather-icon': mockElements.icon,
    'temp-now': mockElements.tempNow,
    'weather-desc': mockElements.description,
    'weather-range': mockElements.range,
  }
  return elementMap[id] || null
})

// Mock WeatherService
const mockWeatherService = {
  mapIconCodeToSVG: jest.fn((iconCode: string) => `mapped-${iconCode}`),
} as unknown as WeatherService

describe('WeatherDisplay', () => {
  let weatherDisplay: WeatherDisplay

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock document.getElementById
    jest
      .spyOn(document, 'getElementById')
      .mockImplementation(mockGetElementById)

    // Clear element content
    Object.values(mockElements).forEach(element => {
      element.textContent = ''
      if (element instanceof HTMLObjectElement) {
        element.data = ''
        element.removeAttribute('alt')
      }
    })

    // Create WeatherDisplay instance
    weatherDisplay = new WeatherDisplay(mockWeatherService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize DOM element references', () => {
      expect(document.getElementById).toHaveBeenCalledWith('weather-icon')
      expect(document.getElementById).toHaveBeenCalledWith('temp-now')
      expect(document.getElementById).toHaveBeenCalledWith('weather-desc')
      expect(document.getElementById).toHaveBeenCalledWith('weather-range')
    })

    it('should handle missing DOM elements gracefully', () => {
      // Create new instance with missing elements
      mockGetElementById.mockReturnValue(null)

      expect(() => {
        new WeatherDisplay(mockWeatherService)
      }).not.toThrow()
    })
  })

  describe('updateDisplay', () => {
    const mockCurrentWeather: ProcessedWeatherData['current'] = {
      temperature: 72.5,
      description: 'Clear sky',
      iconCode: '01d',
      maxTemp: 78.2,
      minTemp: 65.1,
    }

    it('should update all weather display elements', () => {
      // Ensure all elements are available
      expect(mockElements.icon).toBeTruthy()
      expect(mockElements.tempNow).toBeTruthy()
      expect(mockElements.description).toBeTruthy()
      expect(mockElements.range).toBeTruthy()

      // Debug: Check if elements are found by the component
      console.log('Testing elements:', {
        icon: document.getElementById('weather-icon'),
        tempNow: document.getElementById('temp-now'),
        description: document.getElementById('weather-desc'),
        range: document.getElementById('weather-range'),
      })

      weatherDisplay.updateDisplay(mockCurrentWeather)

      // Check icon update
      expect(mockWeatherService.mapIconCodeToSVG).toHaveBeenCalledWith('01d')
      expect(mockElements.icon.data).toBe('weather-icons/mapped-01d.svg')
      expect(mockElements.icon.getAttribute('alt')).toBe('Clear sky')

      // Check temperature update (should be rounded)
      expect(mockElements.tempNow.textContent).toBe('73°')

      // Check description update
      expect(mockElements.description.textContent).toBe('Clear sky')

      // Check temperature range update (should be rounded)
      expect(mockElements.range.textContent).toBe('78° / 65°')
    })

    it('should handle different weather conditions', () => {
      const rainyWeather: ProcessedWeatherData['current'] = {
        temperature: 45.8,
        description: 'Heavy rain',
        iconCode: '10n',
        maxTemp: 50.1,
        minTemp: 42.3,
      }

      weatherDisplay.updateDisplay(rainyWeather)

      expect(mockWeatherService.mapIconCodeToSVG).toHaveBeenCalledWith('10n')
      expect(mockElements.tempNow.textContent).toBe('46°')
      expect(mockElements.description.textContent).toBe('Heavy rain')
      expect(mockElements.range.textContent).toBe('50° / 42°')
    })

    it('should handle negative temperatures', () => {
      const coldWeather: ProcessedWeatherData['current'] = {
        temperature: -5.7,
        description: 'Snow',
        iconCode: '13d',
        maxTemp: -2.1,
        minTemp: -8.9,
      }

      weatherDisplay.updateDisplay(coldWeather)

      expect(mockElements.tempNow.textContent).toBe('-6°')
      expect(mockElements.range.textContent).toBe('-2° / -9°')
    })

    it('should handle missing DOM elements gracefully', () => {
      // Clear one element reference
      mockGetElementById.mockImplementation(
        (id: string): HTMLElement | null => {
          if (id === 'temp-now') return null
          return mockElements[id as keyof typeof mockElements] || null
        }
      )

      // Reinitialize to get null element
      weatherDisplay.refreshElements()

      expect(() => {
        weatherDisplay.updateDisplay(mockCurrentWeather)
      }).not.toThrow()

      // Other elements should still be updated
      expect(mockElements.description.textContent).toBe('Clear sky')
    })

    it('should show error state when update fails', () => {
      // Mock console.error to avoid test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Cause an error by passing invalid data
      const invalidWeather = null as any

      weatherDisplay.updateDisplay(invalidWeather)

      // Check error state
      expect(mockElements.tempNow.textContent).toBe('--°')
      expect(mockElements.description.textContent).toBe(
        'Weather data unavailable'
      )
      expect(mockElements.range.textContent).toBe('--° / --°')

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error updating weather display:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('icon handling', () => {
    it('should set correct icon path and alt text', () => {
      const weather: ProcessedWeatherData['current'] = {
        temperature: 75,
        description: 'Partly cloudy',
        iconCode: '02d',
        maxTemp: 80,
        minTemp: 70,
      }

      weatherDisplay.updateDisplay(weather)

      expect(mockElements.icon.data).toBe('weather-icons/mapped-02d.svg')
      expect(mockElements.icon.getAttribute('alt')).toBe('Partly cloudy')
    })

    it('should handle various icon codes', () => {
      const iconCodes = ['01d', '01n', '10d', '11n', '13d', '50n']

      iconCodes.forEach(iconCode => {
        const weather: ProcessedWeatherData['current'] = {
          temperature: 70,
          description: 'Test weather',
          iconCode,
          maxTemp: 75,
          minTemp: 65,
        }

        weatherDisplay.updateDisplay(weather)

        expect(mockWeatherService.mapIconCodeToSVG).toHaveBeenCalledWith(
          iconCode
        )
        expect(mockElements.icon.data).toBe(
          `weather-icons/mapped-${iconCode}.svg`
        )
      })
    })

    it('should handle missing icon element', () => {
      mockGetElementById.mockImplementation(
        (id: string): HTMLElement | null => {
          if (id === 'weather-icon') return null
          return mockElements[id as keyof typeof mockElements] || null
        }
      )

      weatherDisplay.refreshElements()

      const weather: ProcessedWeatherData['current'] = {
        temperature: 70,
        description: 'Test',
        iconCode: '01d',
        maxTemp: 75,
        minTemp: 65,
      }

      expect(() => {
        weatherDisplay.updateDisplay(weather)
      }).not.toThrow()
    })
  })

  describe('error handling', () => {
    it('should show error state when explicitly called', () => {
      weatherDisplay['showErrorState']()

      expect(mockElements.tempNow.textContent).toBe('--°')
      expect(mockElements.description.textContent).toBe(
        'Weather data unavailable'
      )
      expect(mockElements.range.textContent).toBe('--° / --°')
    })

    it('should handle partial DOM element availability in error state', () => {
      // Remove one element
      mockGetElementById.mockImplementation(
        (id: string): HTMLElement | null => {
          if (id === 'weather-desc') return null
          return mockElements[id as keyof typeof mockElements] || null
        }
      )

      weatherDisplay.refreshElements()
      weatherDisplay['showErrorState']()

      // Available elements should show error state
      expect(mockElements.tempNow.textContent).toBe('--°')
      expect(mockElements.range.textContent).toBe('--° / --°')
    })
  })

  describe('DOM element management', () => {
    it('should refresh element references when requested', () => {
      const spy = jest.spyOn(document, 'getElementById')
      spy.mockClear()

      weatherDisplay.refreshElements()

      expect(spy).toHaveBeenCalledWith('weather-icon')
      expect(spy).toHaveBeenCalledWith('temp-now')
      expect(spy).toHaveBeenCalledWith('weather-desc')
      expect(spy).toHaveBeenCalledWith('weather-range')
    })

    it('should handle element refreshing when DOM changes', () => {
      // Initial elements
      const weather: ProcessedWeatherData['current'] = {
        temperature: 70,
        description: 'Test',
        iconCode: '01d',
        maxTemp: 75,
        minTemp: 65,
      }

      weatherDisplay.updateDisplay(weather)
      expect(mockElements.tempNow.textContent).toBe('70°')

      // Simulate DOM change - new element
      const newTempElement = document.createElement('div')
      mockGetElementById.mockImplementation(
        (id: string): HTMLElement | null => {
          if (id === 'temp-now') return newTempElement
          return mockElements[id as keyof typeof mockElements] || null
        }
      )

      // Refresh and update again
      weatherDisplay.refreshElements()
      weatherDisplay.updateDisplay(weather)

      // New element should be updated
      expect(newTempElement.textContent).toBe('70°')
      // Old element should remain unchanged
      expect(mockElements.tempNow.textContent).toBe('70°')
    })
  })

  describe('temperature formatting edge cases', () => {
    it('should handle extreme temperatures', () => {
      const extremeWeather: ProcessedWeatherData['current'] = {
        temperature: 120.9,
        description: 'Extreme heat',
        iconCode: '01d',
        maxTemp: 125.1,
        minTemp: 118.7,
      }

      weatherDisplay.updateDisplay(extremeWeather)

      expect(mockElements.tempNow.textContent).toBe('121°')
      expect(mockElements.range.textContent).toBe('125° / 119°')
    })

    it('should handle zero temperatures', () => {
      const freezingWeather: ProcessedWeatherData['current'] = {
        temperature: 0.4,
        description: 'Freezing',
        iconCode: '13d',
        maxTemp: 1.2,
        minTemp: -0.8,
      }

      weatherDisplay.updateDisplay(freezingWeather)

      expect(mockElements.tempNow.textContent).toBe('0°')
      expect(mockElements.range.textContent).toBe('1° / -1°')
    })

    it('should handle decimal temperatures correctly', () => {
      const preciseWeather: ProcessedWeatherData['current'] = {
        temperature: 72.5,
        description: 'Pleasant',
        iconCode: '02d',
        maxTemp: 75.7,
        minTemp: 68.3,
      }

      weatherDisplay.updateDisplay(preciseWeather)

      // Should round to nearest integer
      expect(mockElements.tempNow.textContent).toBe('73°')
      expect(mockElements.range.textContent).toBe('76° / 68°')
    })
  })
})
