/**
 * WeatherDisplay Component Tests (3.5.1)
 *
 * Tests for WeatherDisplay component covering:
 * - DOM updates with weather data
 * - Icon loading and display
 * - Temperature and description rendering
 * - Error state handling
 */

import type { Mock } from 'vitest'
import { WeatherDisplay } from '../../src/components/Weather/WeatherDisplay'
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
      <div id="feels-like"></div>
      <span id="wind-direction"></span>
      <span id="wind-speed"></span>
      <div id="weather-desc"></div>
      <div id="weather-range"></div>
    `

    mockWeatherService = {
      mapIconCodeToSVG: vi.fn().mockReturnValue('clear-day'),
    }

    weatherDisplay = new WeatherDisplay(
      mockWeatherService as unknown as WeatherService
    )

    mockCurrentWeather = {
      temperature: 75,
      feelsLike: 72,
      description: 'clear sky',
      iconCode: '01d',
      minTemp: 58,
      maxTemp: 82,
      windSpeed: 5,
      windDirection: 'SW',
    }
  })

  describe('DOM updates with weather data', () => {
    it('should update all display elements when updateDisplay is called', () => {
      weatherDisplay.updateDisplay(mockCurrentWeather)

      expect(document.getElementById('temp-now')!.textContent).toBe('75°')
      expect(document.getElementById('feels-like')!.textContent).toBe('72°')
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
        feelsLike: 42,
        description: 'heavy intensity rain',
        iconCode: '10d',
        minTemp: 38,
        maxTemp: 52,
        windSpeed: 13,
        windDirection: 'W',
        windGust: 19,
      }
      ;(mockWeatherService.mapIconCodeToSVG as Mock).mockReturnValue('rain')

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
        feelsLike: 57,
        description: 'overcast clouds',
        iconCode: '04d',
        minTemp: 50,
        maxTemp: 65,
        windSpeed: 8,
        windDirection: 'N',
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
      ;(mockWeatherService.mapIconCodeToSVG as Mock).mockReturnValue(
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
        feelsLike: 20,
        description: 'heavy snow',
        iconCode: '13d',
        minTemp: 18,
        maxTemp: 32,
        windSpeed: 9,
        windDirection: 'N',
      }
      ;(mockWeatherService.mapIconCodeToSVG as Mock).mockReturnValue('snow')

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
        feelsLike: -24,
        description: 'heavy snow',
        iconCode: '13d',
        minTemp: -28,
        maxTemp: -8,
        windSpeed: 19,
        windDirection: 'NW',
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
        feelsLike: -4,
        description: 'freezing fog',
        iconCode: '50d',
        minTemp: -5,
        maxTemp: 2,
        windSpeed: 3,
        windDirection: 'E',
      }

      weatherDisplay.updateDisplay(freezingWeather)

      expect(document.getElementById('temp-now')!.textContent).toBe('0°')
    })
  })

  describe('Feels-like temperature rendering', () => {
    it('should render feels-like temperature with degree symbol', () => {
      weatherDisplay.updateDisplay(mockCurrentWeather)

      expect(document.getElementById('feels-like')!.textContent).toBe('72°')
    })

    it('should render feels-like independently of current temperature', () => {
      const weather: ProcessedWeatherData['current'] = {
        ...mockCurrentWeather,
        temperature: 90,
        feelsLike: 98,
      }

      weatherDisplay.updateDisplay(weather)

      expect(document.getElementById('temp-now')!.textContent).toBe('90°')
      expect(document.getElementById('feels-like')!.textContent).toBe('98°')
    })

    it('should handle negative feels-like temperature', () => {
      const weather: ProcessedWeatherData['current'] = {
        ...mockCurrentWeather,
        feelsLike: -10,
      }

      weatherDisplay.updateDisplay(weather)

      expect(document.getElementById('feels-like')!.textContent).toBe('-10°')
    })

    it('should overwrite previous feels-like value on subsequent calls', () => {
      weatherDisplay.updateDisplay(mockCurrentWeather)

      const updated: ProcessedWeatherData['current'] = {
        ...mockCurrentWeather,
        feelsLike: 85,
      }
      weatherDisplay.updateDisplay(updated)

      expect(document.getElementById('feels-like')!.textContent).toBe('85°')
    })
  })

  describe('Error propagation', () => {
    it('should throw when updateDisplay encounters an error', () => {
      const thrownError = new Error('Icon mapping failed')
      ;(mockWeatherService.mapIconCodeToSVG as Mock).mockImplementation(() => {
        throw thrownError
      })

      expect(() => weatherDisplay.updateDisplay(mockCurrentWeather)).toThrow(
        thrownError
      )
    })
  })
})
