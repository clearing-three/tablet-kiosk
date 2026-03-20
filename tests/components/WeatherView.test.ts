/**
 * WeatherView Component Tests (3.5.1)
 *
 * Tests for WeatherView component covering:
 * - DOM updates with weather data
 * - Temperature rendering
 */

import { WeatherView } from '../../src/components/Weather/WeatherView'
import type { WeatherData } from '../../src/types/weather-domain.types'

describe('WeatherView', () => {
  let weatherView: WeatherView
  let mockCurrentWeather: WeatherData['current']

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="temp-now"></div>
      <div id="feels-like"></div>
      <span id="wind-direction"></span>
      <div id="wind-speed"></div>
      <div id="weather-range"></div>
    `

    weatherView = new WeatherView()

    mockCurrentWeather = {
      temperature: 75,
      feelsLike: 72,
      description: 'clear sky',
      icon: 'clear-day',
      minTemp: 58,
      maxTemp: 82,
      windSpeed: 5,
      windDirection: 'SW',
    }
  })

  describe('DOM updates with weather data', () => {
    it('should update all display elements when render is called', () => {
      weatherView.render(mockCurrentWeather)

      expect(document.getElementById('temp-now')!.textContent).toBe('75')
      expect(document.getElementById('feels-like')!.textContent).toBe('72')
      const rangeEl = document.getElementById('weather-range')!
      expect(rangeEl.querySelector('.temp-high')?.textContent).toBe('82')
      expect(rangeEl.querySelector('.temp-low')?.textContent).toBe('58')
    })

    it('should update elements with different weather data', () => {
      const rainyWeather: WeatherData['current'] = {
        temperature: 45,
        feelsLike: 42,
        description: 'heavy intensity rain',
        icon: 'rain',
        minTemp: 38,
        maxTemp: 52,
        windSpeed: 13,
        windDirection: 'W',
        windGust: 19,
      }

      weatherView.render(rainyWeather)

      expect(document.getElementById('temp-now')!.textContent).toBe('45')
      const rangeEl = document.getElementById('weather-range')!
      expect(rangeEl.querySelector('.temp-high')?.textContent).toBe('52')
      expect(rangeEl.querySelector('.temp-low')?.textContent).toBe('38')
    })

    it('should overwrite previous display values on subsequent calls', () => {
      weatherView.render(mockCurrentWeather)

      const updatedWeather: WeatherData['current'] = {
        temperature: 60,
        feelsLike: 57,
        description: 'overcast clouds',
        icon: 'overcast',
        minTemp: 50,
        maxTemp: 65,
        windSpeed: 8,
        windDirection: 'N',
      }
      weatherView.render(updatedWeather)

      expect(document.getElementById('temp-now')!.textContent).toBe('60')
      const rangeEl = document.getElementById('weather-range')!
      expect(rangeEl.querySelector('.temp-high')?.textContent).toBe('65')
      expect(rangeEl.querySelector('.temp-low')?.textContent).toBe('50')
    })
  })

  describe('Temperature rendering', () => {
    it('should render temperature with a degree symbol', () => {
      weatherView.render(mockCurrentWeather)

      expect(document.getElementById('temp-now')!.textContent).toBe('75')
    })

    it('should render temperature range with styled high/low spans', () => {
      weatherView.render(mockCurrentWeather)

      const rangeEl = document.getElementById('weather-range')!
      expect(rangeEl.querySelector('.temp-high')?.textContent).toBe('82')
      expect(rangeEl.querySelector('.temp-low')?.textContent).toBe('58')
    })

    it('should handle negative temperatures', () => {
      const coldWeather: WeatherData['current'] = {
        temperature: -15,
        feelsLike: -24,
        description: 'heavy snow',
        icon: 'snow',
        minTemp: -28,
        maxTemp: -8,
        windSpeed: 19,
        windDirection: 'NW',
      }

      weatherView.render(coldWeather)

      expect(document.getElementById('temp-now')!.textContent).toBe('-15')
      const rangeEl = document.getElementById('weather-range')!
      expect(rangeEl.querySelector('.temp-high')?.textContent).toBe('-8')
      expect(rangeEl.querySelector('.temp-low')?.textContent).toBe('-28')
    })

    it('should handle zero temperature', () => {
      const freezingWeather: WeatherData['current'] = {
        temperature: 0,
        feelsLike: -4,
        description: 'freezing fog',
        icon: 'mist',
        minTemp: -5,
        maxTemp: 2,
        windSpeed: 3,
        windDirection: 'E',
      }

      weatherView.render(freezingWeather)

      expect(document.getElementById('temp-now')!.textContent).toBe('0')
    })
  })

  describe('Feels-like temperature rendering', () => {
    it('should render feels-like temperature with degree symbol', () => {
      weatherView.render(mockCurrentWeather)

      expect(document.getElementById('feels-like')!.textContent).toBe('72')
    })

    it('should render feels-like independently of current temperature', () => {
      const weather: WeatherData['current'] = {
        ...mockCurrentWeather,
        temperature: 90,
        feelsLike: 98,
      }

      weatherView.render(weather)

      expect(document.getElementById('temp-now')!.textContent).toBe('90')
      expect(document.getElementById('feels-like')!.textContent).toBe('98')
    })

    it('should handle negative feels-like temperature', () => {
      const weather: WeatherData['current'] = {
        ...mockCurrentWeather,
        feelsLike: -10,
      }

      weatherView.render(weather)

      expect(document.getElementById('feels-like')!.textContent).toBe('-10')
    })

    it('should overwrite previous feels-like value on subsequent calls', () => {
      weatherView.render(mockCurrentWeather)

      const updated: WeatherData['current'] = {
        ...mockCurrentWeather,
        feelsLike: 85,
      }
      weatherView.render(updated)

      expect(document.getElementById('feels-like')!.textContent).toBe('85')
    })
  })

  describe('Wind display', () => {
    it('should display wind speed without gust', () => {
      weatherView.render(mockCurrentWeather)

      const windSpeed = document.getElementById('wind-speed')!
      expect(windSpeed.textContent).toBe('5')
      expect(windSpeed.querySelector('.wind-gust')).toBeNull()
    })

    it('should display wind direction', () => {
      weatherView.render(mockCurrentWeather)

      const windDirection = document.getElementById('wind-direction')!
      expect(windDirection.textContent).toBe('SW')
    })

    it('should display wind speed with gust using separate element', () => {
      const gustyWeather: WeatherData['current'] = {
        ...mockCurrentWeather,
        windGust: 19,
      }

      weatherView.render(gustyWeather)

      const windSpeed = document.getElementById('wind-speed')!
      const gustElement = windSpeed.querySelector('.wind-gust')
      expect(gustElement).not.toBeNull()
      expect(gustElement?.textContent).toBe('19')
    })

    it('should update wind display on subsequent calls', () => {
      weatherView.render(mockCurrentWeather)

      const updatedWeather: WeatherData['current'] = {
        ...mockCurrentWeather,
        windSpeed: 12,
        windDirection: 'NE',
        windGust: 22,
      }
      weatherView.render(updatedWeather)

      const windSpeed = document.getElementById('wind-speed')!
      const windDirection = document.getElementById('wind-direction')!
      const gustElement = windSpeed.querySelector('.wind-gust')

      expect(windDirection.textContent).toBe('NE')
      expect(windSpeed.textContent).toContain('12')
      expect(gustElement?.textContent).toBe('22')
    })
  })
})
