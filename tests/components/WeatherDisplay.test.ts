/**
 * WeatherDisplay Component Tests (3.5.1)
 *
 * Tests for WeatherDisplay component covering:
 * - DOM updates with weather data
 * - Icon loading and display
 * - Temperature and description rendering
 * - Error state handling
 */

import {
  WeatherDisplay,
  WEATHER_ERROR_TEMP,
  WEATHER_ERROR_DESCRIPTION,
  WEATHER_ERROR_RANGE,
} from '../../src/components/Weather/WeatherDisplay'
import { WeatherService } from '../../src/services/WeatherService'
import type { ProcessedWeatherData } from '../../src/types/weather.types'

describe('WeatherDisplay', () => {
  let weatherDisplay: WeatherDisplay
  let mockWeatherService: Pick<WeatherService, 'mapIconCodeToSVG'>
  let mockCurrentWeather: ProcessedWeatherData['current']

  beforeEach(() => {
    document.body.innerHTML = `
      <object id="weather-icon"></object>
      <div id="temp-now"></div>
      <div id="weather-desc"></div>
      <div id="weather-range"></div>
    `

    mockWeatherService = {
      mapIconCodeToSVG: jest.fn().mockReturnValue('clear-day'),
    }

    weatherDisplay = new WeatherDisplay(
      mockWeatherService as unknown as WeatherService
    )

    mockCurrentWeather = {
      temperature: 75,
      description: 'clear sky',
      iconCode: '01d',
      minTemp: 58,
      maxTemp: 82,
    }
  })

  describe('DOM updates with weather data', () => {
    it('should update all display elements when updateDisplay is called', () => {
      weatherDisplay.updateDisplay(mockCurrentWeather)

      expect(document.getElementById('temp-now')!.textContent).toBe('75°')
      expect(document.getElementById('weather-desc')!.textContent).toBe(
        'clear sky'
      )
      expect(document.getElementById('weather-range')!.textContent).toBe(
        '82° / 58°'
      )
    })

    it('should update elements with different weather data', () => {
      const rainyWeather: ProcessedWeatherData['current'] = {
        temperature: 45,
        description: 'heavy intensity rain',
        iconCode: '10d',
        minTemp: 38,
        maxTemp: 52,
      }
      ;(mockWeatherService.mapIconCodeToSVG as jest.Mock).mockReturnValue(
        'rain'
      )

      weatherDisplay.updateDisplay(rainyWeather)

      expect(document.getElementById('temp-now')!.textContent).toBe('45°')
      expect(document.getElementById('weather-desc')!.textContent).toBe(
        'heavy intensity rain'
      )
      expect(document.getElementById('weather-range')!.textContent).toBe(
        '52° / 38°'
      )
    })

    it('should overwrite previous display values on subsequent calls', () => {
      weatherDisplay.updateDisplay(mockCurrentWeather)

      const updatedWeather: ProcessedWeatherData['current'] = {
        temperature: 60,
        description: 'overcast clouds',
        iconCode: '04d',
        minTemp: 50,
        maxTemp: 65,
      }
      weatherDisplay.updateDisplay(updatedWeather)

      expect(document.getElementById('temp-now')!.textContent).toBe('60°')
      expect(document.getElementById('weather-desc')!.textContent).toBe(
        'overcast clouds'
      )
      expect(document.getElementById('weather-range')!.textContent).toBe(
        '65° / 50°'
      )
    })
  })

  describe('Icon loading and display', () => {
    it('should set the icon data attribute to the mapped SVG path', () => {
      ;(mockWeatherService.mapIconCodeToSVG as jest.Mock).mockReturnValue(
        'clear-day'
      )

      weatherDisplay.updateDisplay(mockCurrentWeather)

      const icon = document.getElementById('weather-icon') as HTMLObjectElement
      expect(icon.data).toContain('weather-icons/clear-day.svg')
    })

    it('should set the icon alt attribute to the weather description', () => {
      weatherDisplay.updateDisplay(mockCurrentWeather)

      const icon = document.getElementById('weather-icon') as HTMLObjectElement
      expect(icon.getAttribute('alt')).toBe('clear sky')
    })

    it('should call mapIconCodeToSVG with the correct icon code', () => {
      weatherDisplay.updateDisplay(mockCurrentWeather)

      expect(mockWeatherService.mapIconCodeToSVG).toHaveBeenCalledWith('01d')
    })

    it('should update icon data and alt correctly for a different icon code', () => {
      const snowWeather: ProcessedWeatherData['current'] = {
        temperature: 28,
        description: 'heavy snow',
        iconCode: '13d',
        minTemp: 18,
        maxTemp: 32,
      }
      ;(mockWeatherService.mapIconCodeToSVG as jest.Mock).mockReturnValue(
        'snow'
      )

      weatherDisplay.updateDisplay(snowWeather)

      const icon = document.getElementById('weather-icon') as HTMLObjectElement
      expect(icon.data).toContain('weather-icons/snow.svg')
      expect(icon.getAttribute('alt')).toBe('heavy snow')
    })
  })

  describe('Temperature and description rendering', () => {
    it('should render temperature with a degree symbol', () => {
      weatherDisplay.updateDisplay(mockCurrentWeather)

      expect(document.getElementById('temp-now')!.textContent).toBe('75°')
    })

    it('should render temperature range in "max° / min°" format', () => {
      weatherDisplay.updateDisplay(mockCurrentWeather)

      expect(document.getElementById('weather-range')!.textContent).toBe(
        '82° / 58°'
      )
    })

    it('should render the weather description exactly as provided', () => {
      const detailedDesc: ProcessedWeatherData['current'] = {
        ...mockCurrentWeather,
        description: 'thunderstorm with heavy rain',
      }

      weatherDisplay.updateDisplay(detailedDesc)

      expect(document.getElementById('weather-desc')!.textContent).toBe(
        'thunderstorm with heavy rain'
      )
    })

    it('should handle negative temperatures', () => {
      const coldWeather: ProcessedWeatherData['current'] = {
        temperature: -15,
        description: 'heavy snow',
        iconCode: '13d',
        minTemp: -28,
        maxTemp: -8,
      }

      weatherDisplay.updateDisplay(coldWeather)

      expect(document.getElementById('temp-now')!.textContent).toBe('-15°')
      expect(document.getElementById('weather-range')!.textContent).toBe(
        '-8° / -28°'
      )
    })

    it('should handle zero temperature', () => {
      const freezingWeather: ProcessedWeatherData['current'] = {
        temperature: 0,
        description: 'freezing fog',
        iconCode: '50d',
        minTemp: -5,
        maxTemp: 2,
      }

      weatherDisplay.updateDisplay(freezingWeather)

      expect(document.getElementById('temp-now')!.textContent).toBe('0°')
    })
  })

  describe('Error state handling', () => {
    it('should show error placeholders when updateDisplay throws', () => {
      ;(mockWeatherService.mapIconCodeToSVG as jest.Mock).mockImplementation(
        () => {
          throw new Error('Icon mapping failed')
        }
      )

      weatherDisplay.updateDisplay(mockCurrentWeather)

      expect(document.getElementById('temp-now')!.textContent).toBe(
        WEATHER_ERROR_TEMP
      )
      expect(document.getElementById('weather-desc')!.textContent).toBe(
        WEATHER_ERROR_DESCRIPTION
      )
      expect(document.getElementById('weather-range')!.textContent).toBe(
        WEATHER_ERROR_RANGE
      )
    })

    it('should log the error to console when updateDisplay throws', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const thrownError = new Error('Icon mapping failed')
      ;(mockWeatherService.mapIconCodeToSVG as jest.Mock).mockImplementation(
        () => {
          throw thrownError
        }
      )

      weatherDisplay.updateDisplay(mockCurrentWeather)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error updating weather display:',
        thrownError
      )
      consoleSpy.mockRestore()
    })

    it('should not throw when DOM elements are missing', () => {
      document.body.innerHTML = ''
      weatherDisplay.refreshElements()

      expect(() =>
        weatherDisplay.updateDisplay(mockCurrentWeather)
      ).not.toThrow()
    })

    it('should update available elements when only some are present', () => {
      document.body.innerHTML = '<div id="temp-now"></div>'
      weatherDisplay.refreshElements()

      expect(() =>
        weatherDisplay.updateDisplay(mockCurrentWeather)
      ).not.toThrow()
      expect(document.getElementById('temp-now')!.textContent).toBe('75°')
    })

    describe('showErrorState branch coverage', () => {
      const triggerError = () => {
        ;(mockWeatherService.mapIconCodeToSVG as jest.Mock).mockImplementation(
          () => {
            throw new Error('forced error')
          }
        )
        weatherDisplay.updateDisplay(mockCurrentWeather)
      }

      it('should skip tempNow update when that element is missing', () => {
        document.body.innerHTML = `
          <object id="weather-icon"></object>
          <div id="weather-desc"></div>
          <div id="weather-range"></div>
        `
        weatherDisplay.refreshElements()
        triggerError()

        expect(document.getElementById('weather-desc')!.textContent).toBe(
          WEATHER_ERROR_DESCRIPTION
        )
        expect(document.getElementById('weather-range')!.textContent).toBe(
          WEATHER_ERROR_RANGE
        )
      })

      it('should skip description update when that element is missing', () => {
        document.body.innerHTML = `
          <object id="weather-icon"></object>
          <div id="temp-now"></div>
          <div id="weather-range"></div>
        `
        weatherDisplay.refreshElements()
        triggerError()

        expect(document.getElementById('temp-now')!.textContent).toBe(
          WEATHER_ERROR_TEMP
        )
        expect(document.getElementById('weather-range')!.textContent).toBe(
          WEATHER_ERROR_RANGE
        )
      })

      it('should skip range update when that element is missing', () => {
        document.body.innerHTML = `
          <object id="weather-icon"></object>
          <div id="temp-now"></div>
          <div id="weather-desc"></div>
        `
        weatherDisplay.refreshElements()
        triggerError()

        expect(document.getElementById('temp-now')!.textContent).toBe(
          WEATHER_ERROR_TEMP
        )
        expect(document.getElementById('weather-desc')!.textContent).toBe(
          WEATHER_ERROR_DESCRIPTION
        )
      })
    })
  })

  describe('refreshElements', () => {
    it('should pick up newly added DOM elements after a refresh', () => {
      document.body.innerHTML = ''
      weatherDisplay.refreshElements()
      expect(() =>
        weatherDisplay.updateDisplay(mockCurrentWeather)
      ).not.toThrow()

      document.body.innerHTML = `
        <object id="weather-icon"></object>
        <div id="temp-now"></div>
        <div id="weather-desc"></div>
        <div id="weather-range"></div>
      `
      weatherDisplay.refreshElements()
      weatherDisplay.updateDisplay(mockCurrentWeather)

      expect(document.getElementById('temp-now')!.textContent).toBe('75°')
      expect(document.getElementById('weather-desc')!.textContent).toBe(
        'clear sky'
      )
    })
  })
})
