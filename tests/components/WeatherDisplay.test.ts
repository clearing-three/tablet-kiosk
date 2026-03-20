/**
 * WeatherDisplay Component Tests (3.5.1)
 *
 * Tests for WeatherDisplay component covering:
 * - DOM updates with weather data
 * - Temperature rendering
 */

import { WeatherDisplay } from '../../src/components/Weather/WeatherDisplay'
import type { ProcessedWeatherData } from '../../src/types/weather-domain.types'

describe('WeatherDisplay', () => {
  let weatherDisplay: WeatherDisplay
  let mockCurrentWeather: ProcessedWeatherData['current']

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="temp-now"></div>
      <div id="feels-like"></div>
      <span id="wind-direction"></span>
      <div id="wind-speed"></div>
      <div id="weather-range"></div>
    `

    weatherDisplay = new WeatherDisplay()

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

      expect(document.getElementById('temp-now')!.textContent).toBe('75')
      expect(document.getElementById('feels-like')!.textContent).toBe('72')
      const rangeEl = document.getElementById('weather-range')!
      expect(rangeEl.querySelector('.temp-high')?.textContent).toBe('82')
      expect(rangeEl.querySelector('.temp-low')?.textContent).toBe('58')
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

      weatherDisplay.updateDisplay(rainyWeather)

      expect(document.getElementById('temp-now')!.textContent).toBe('45')
      const rangeEl = document.getElementById('weather-range')!
      expect(rangeEl.querySelector('.temp-high')?.textContent).toBe('52')
      expect(rangeEl.querySelector('.temp-low')?.textContent).toBe('38')
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

      expect(document.getElementById('temp-now')!.textContent).toBe('60')
      const rangeEl = document.getElementById('weather-range')!
      expect(rangeEl.querySelector('.temp-high')?.textContent).toBe('65')
      expect(rangeEl.querySelector('.temp-low')?.textContent).toBe('50')
    })
  })

  describe('Temperature rendering', () => {
    it('should render temperature with a degree symbol', () => {
      weatherDisplay.updateDisplay(mockCurrentWeather)

      expect(document.getElementById('temp-now')!.textContent).toBe('75')
    })

    it('should render temperature range with styled high/low spans', () => {
      weatherDisplay.updateDisplay(mockCurrentWeather)

      const rangeEl = document.getElementById('weather-range')!
      expect(rangeEl.querySelector('.temp-high')?.textContent).toBe('82')
      expect(rangeEl.querySelector('.temp-low')?.textContent).toBe('58')
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

      expect(document.getElementById('temp-now')!.textContent).toBe('-15')
      const rangeEl = document.getElementById('weather-range')!
      expect(rangeEl.querySelector('.temp-high')?.textContent).toBe('-8')
      expect(rangeEl.querySelector('.temp-low')?.textContent).toBe('-28')
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

      expect(document.getElementById('temp-now')!.textContent).toBe('0')
    })
  })

  describe('Feels-like temperature rendering', () => {
    it('should render feels-like temperature with degree symbol', () => {
      weatherDisplay.updateDisplay(mockCurrentWeather)

      expect(document.getElementById('feels-like')!.textContent).toBe('72')
    })

    it('should render feels-like independently of current temperature', () => {
      const weather: ProcessedWeatherData['current'] = {
        ...mockCurrentWeather,
        temperature: 90,
        feelsLike: 98,
      }

      weatherDisplay.updateDisplay(weather)

      expect(document.getElementById('temp-now')!.textContent).toBe('90')
      expect(document.getElementById('feels-like')!.textContent).toBe('98')
    })

    it('should handle negative feels-like temperature', () => {
      const weather: ProcessedWeatherData['current'] = {
        ...mockCurrentWeather,
        feelsLike: -10,
      }

      weatherDisplay.updateDisplay(weather)

      expect(document.getElementById('feels-like')!.textContent).toBe('-10')
    })

    it('should overwrite previous feels-like value on subsequent calls', () => {
      weatherDisplay.updateDisplay(mockCurrentWeather)

      const updated: ProcessedWeatherData['current'] = {
        ...mockCurrentWeather,
        feelsLike: 85,
      }
      weatherDisplay.updateDisplay(updated)

      expect(document.getElementById('feels-like')!.textContent).toBe('85')
    })
  })

  describe('Wind display', () => {
    it('should display wind speed without gust', () => {
      weatherDisplay.updateDisplay(mockCurrentWeather)

      const windSpeed = document.getElementById('wind-speed')!
      expect(windSpeed.textContent).toBe('5')
      expect(windSpeed.querySelector('.wind-gust')).toBeNull()
    })

    it('should display wind direction', () => {
      weatherDisplay.updateDisplay(mockCurrentWeather)

      const windDirection = document.getElementById('wind-direction')!
      expect(windDirection.textContent).toBe('SW')
    })

    it('should display wind speed with gust using separate element', () => {
      const gustyWeather: ProcessedWeatherData['current'] = {
        ...mockCurrentWeather,
        windGust: 19,
      }

      weatherDisplay.updateDisplay(gustyWeather)

      const windSpeed = document.getElementById('wind-speed')!
      const gustElement = windSpeed.querySelector('.wind-gust')
      expect(gustElement).not.toBeNull()
      expect(gustElement?.textContent).toBe('19')
    })

    it('should update wind display on subsequent calls', () => {
      weatherDisplay.updateDisplay(mockCurrentWeather)

      const updatedWeather: ProcessedWeatherData['current'] = {
        ...mockCurrentWeather,
        windSpeed: 12,
        windDirection: 'NE',
        windGust: 22,
      }
      weatherDisplay.updateDisplay(updatedWeather)

      const windSpeed = document.getElementById('wind-speed')!
      const windDirection = document.getElementById('wind-direction')!
      const gustElement = windSpeed.querySelector('.wind-gust')

      expect(windDirection.textContent).toBe('NE')
      expect(windSpeed.textContent).toContain('12')
      expect(gustElement?.textContent).toBe('22')
    })
  })
})
