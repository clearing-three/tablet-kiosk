import type { WeatherData } from '../../src/types/weather-domain.types'
import {
  CurrentConditions,
  WIND_ICON_PATH,
} from '../../src/elements/current-conditions'
import { temperatureDisplay } from '../../src/utils/formatters'

void CurrentConditions

const TEMP_A = 72
const FEELS_LIKE_A = 68
const WIND_SPEED_A = 10
const WIND_DIRECTION_A = 'NE'
const WIND_GUST_A = 15
const MAX_TEMP_A = 75
const MIN_TEMP_A = 65

const TEMP_B = 85
const FEELS_LIKE_B = 88
const WIND_SPEED_B = 5
const WIND_DIRECTION_B = 'SW'
const MAX_TEMP_B = 90
const MIN_TEMP_B = 70

describe('current-conditions', () => {
  let element: CurrentConditions

  const getTempNow = (el: CurrentConditions): string => {
    return el.shadowRoot?.querySelector('.temp-now')?.textContent?.trim() ?? ''
  }

  const getFeelsLike = (el: CurrentConditions): string => {
    return el.shadowRoot?.querySelector('.feels-like')?.textContent?.trim() ?? ''
  }

  const getWindSpeed = (el: CurrentConditions): string => {
    return (
      el.shadowRoot?.querySelector('.wind-speed')?.textContent?.trim() ?? ''
    )
  }

  const getWindDirection = (el: CurrentConditions): string => {
    return (
      el.shadowRoot?.querySelector('.wind-direction')?.textContent?.trim() ?? ''
    )
  }

  const getWindGust = (el: CurrentConditions): string => {
    return el.shadowRoot?.querySelector('.wind-gust')?.textContent?.trim() ?? ''
  }

  const getMaxTemp = (el: CurrentConditions): string => {
    return el.shadowRoot?.querySelector('.temp-high')?.textContent?.trim() ?? ''
  }

  const getMinTemp = (el: CurrentConditions): string => {
    return el.shadowRoot?.querySelector('.temp-low')?.textContent?.trim() ?? ''
  }

  const getWindIcon = (el: CurrentConditions): HTMLImageElement | null => {
    return el.shadowRoot?.querySelector('.wind-icon') ?? null
  }

  beforeEach(() => {
    element = document.createElement('x-current-conditions') as CurrentConditions
  })

  afterEach(() => {
    if (element.isConnected) {
      element.remove()
    }
  })

  describe('rendering without weather data', () => {
    it('should render with default values when no weather data', async () => {
      // when
      document.body.appendChild(element)
      await element.updateComplete

      // then
      expect(getTempNow(element)).toBe('')
      expect(getFeelsLike(element)).toBe('')
      expect(getWindSpeed(element)).toContain('0')
      expect(getWindDirection(element)).toBe('')
      expect(getMaxTemp(element)).toBe('')
      expect(getMinTemp(element)).toBe('')

      const icon = getWindIcon(element)
      expect(icon).not.toBeNull()
      expect(icon?.getAttribute('src')).toBe(WIND_ICON_PATH)
      expect(icon?.getAttribute('alt')).toBe('Wind')
    })
  })

  describe('rendering with weather data', () => {
    it('should render all current conditions', async () => {
      // given
      const mockWeatherData: WeatherData = {
        current: {
          temperature: TEMP_A,
          feelsLike: FEELS_LIKE_A,
          windSpeed: WIND_SPEED_A,
          windDirection: WIND_DIRECTION_A,
          windGust: WIND_GUST_A,
          maxTemp: MAX_TEMP_A,
          minTemp: MIN_TEMP_A,
          description: 'Sunny',
          icon: 'clear-day',
        } as WeatherData['current'],
        forecast: [],
        astronomy: {} as WeatherData['astronomy'],
      }
      // when
      document.body.appendChild(element)
      ;(element as any)._weatherData = mockWeatherData
      await element.updateComplete

      // then
      const tempA = temperatureDisplay(TEMP_A)
      const feelsLikeA = temperatureDisplay(FEELS_LIKE_A)
      const maxTempA = temperatureDisplay(MAX_TEMP_A)
      const minTempA = temperatureDisplay(MIN_TEMP_A)

      expect(getTempNow(element)).toContain(tempA.text)
      expect(element.shadowRoot?.querySelector('.temp-now')?.getAttribute('style')).toContain(tempA.color)

      expect(getFeelsLike(element)).toContain(feelsLikeA.text)
      expect(element.shadowRoot?.querySelector('.feels-like')?.getAttribute('style')).toContain(feelsLikeA.color)

      expect(getWindSpeed(element)).toContain(WIND_SPEED_A.toString())
      expect(getWindDirection(element)).toBe(WIND_DIRECTION_A)
      expect(getWindGust(element)).toBe(WIND_GUST_A.toString())

      expect(getMaxTemp(element)).toContain(maxTempA.text)
      expect(element.shadowRoot?.querySelector('.temp-high')?.getAttribute('style')).toContain(maxTempA.color)

      expect(getMinTemp(element)).toContain(minTempA.text)
      expect(element.shadowRoot?.querySelector('.temp-low')?.getAttribute('style')).toContain(minTempA.color)
    })

    it('should not render wind gust when undefined', async () => {
      // given
      const mockWeatherData: WeatherData = {
        current: {
          temperature: TEMP_A,
          feelsLike: FEELS_LIKE_A,
          windSpeed: WIND_SPEED_A,
          windDirection: WIND_DIRECTION_A,
          maxTemp: MAX_TEMP_A,
          minTemp: MIN_TEMP_A,
          description: 'Sunny',
          icon: 'clear-day',
        },
        forecast: [],
        astronomy: {} as WeatherData['astronomy'],
      }
      // when
      document.body.appendChild(element)
      ;(element as any)._weatherData = mockWeatherData
      await element.updateComplete

      // then
      expect(getWindGust(element)).toBe('')
    })

    it('should update conditions when weather data changes', async () => {
      // given
      const firstWeatherData: WeatherData = {
        current: {
          temperature: TEMP_A,
          feelsLike: FEELS_LIKE_A,
          windSpeed: WIND_SPEED_A,
          windDirection: WIND_DIRECTION_A,
          maxTemp: MAX_TEMP_A,
          minTemp: MIN_TEMP_A,
          description: 'Sunny',
          icon: 'clear-day',
        } as WeatherData['current'],
        forecast: [],
        astronomy: {} as WeatherData['astronomy'],
      }
      const secondWeatherData: WeatherData = {
        current: {
          temperature: TEMP_B,
          feelsLike: FEELS_LIKE_B,
          windSpeed: WIND_SPEED_B,
          windDirection: WIND_DIRECTION_B,
          maxTemp: MAX_TEMP_B,
          minTemp: MIN_TEMP_B,
          description: 'Cloudy',
          icon: 'overcast',
        } as WeatherData['current'],
        forecast: [],
        astronomy: {} as WeatherData['astronomy'],
      }

      document.body.appendChild(element)
      ;(element as any)._weatherData = firstWeatherData
      await element.updateComplete

      // then
      const tempA = temperatureDisplay(TEMP_A)
      const feelsLikeA = temperatureDisplay(FEELS_LIKE_A)

      expect(getTempNow(element)).toContain(tempA.text)
      expect(element.shadowRoot?.querySelector('.temp-now')?.getAttribute('style')).toContain(tempA.color)

      expect(getFeelsLike(element)).toContain(feelsLikeA.text)
      expect(element.shadowRoot?.querySelector('.feels-like')?.getAttribute('style')).toContain(feelsLikeA.color)

      expect(getWindSpeed(element)).toContain(WIND_SPEED_A.toString())
      expect(getWindDirection(element)).toBe(WIND_DIRECTION_A)

      // when
      ;(element as any)._weatherData = secondWeatherData
      await element.updateComplete

      // then
      const tempB = temperatureDisplay(TEMP_B)
      const feelsLikeB = temperatureDisplay(FEELS_LIKE_B)

      expect(getTempNow(element)).toContain(tempB.text)
      expect(element.shadowRoot?.querySelector('.temp-now')?.getAttribute('style')).toContain(tempB.color)

      expect(getFeelsLike(element)).toContain(feelsLikeB.text)
      expect(element.shadowRoot?.querySelector('.feels-like')?.getAttribute('style')).toContain(feelsLikeB.color)
      expect(getWindSpeed(element)).toContain(WIND_SPEED_B.toString())
      expect(getWindDirection(element)).toBe(WIND_DIRECTION_B)
    })
  })
})
