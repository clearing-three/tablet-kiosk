import type { Mock } from 'vitest'
import type { WeatherData } from '../../src/types/weather-domain.types'
import {
  CurrentConditions,
  WIND_ICON_PATH,
} from '../../src/elements/current-conditions'
import * as formatters from '../../src/utils/formatters'

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

const TEMP_A_FORMATTED = '72'
const FEELS_LIKE_A_FORMATTED = '68'
const MAX_TEMP_A_FORMATTED = '75'
const MIN_TEMP_A_FORMATTED = '65'

const TEMP_B_FORMATTED = '85'
const FEELS_LIKE_B_FORMATTED = '88'
const MAX_TEMP_B_FORMATTED = '90'
const MIN_TEMP_B_FORMATTED = '70'

describe('current-conditions', () => {
  let element: CurrentConditions
  let mockFormatTemperature: Mock

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
    mockFormatTemperature = vi.fn()
    vi.spyOn(formatters, 'formatTemperature').mockImplementation(
      mockFormatTemperature,
    )
    element = document.createElement('x-current-conditions') as CurrentConditions
  })

  afterEach(() => {
    if (element.isConnected) {
      element.remove()
    }
    vi.restoreAllMocks()
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
      mockFormatTemperature
        .mockReturnValueOnce(TEMP_A_FORMATTED)
        .mockReturnValueOnce(FEELS_LIKE_A_FORMATTED)
        .mockReturnValueOnce(MAX_TEMP_A_FORMATTED)
        .mockReturnValueOnce(MIN_TEMP_A_FORMATTED)

      // when
      document.body.appendChild(element)
      ;(element as any)._weatherData = mockWeatherData
      await element.updateComplete

      // then
      expect(getTempNow(element)).toContain(TEMP_A_FORMATTED)
      expect(getFeelsLike(element)).toContain(FEELS_LIKE_A_FORMATTED)
      expect(getWindSpeed(element)).toContain(WIND_SPEED_A.toString())
      expect(getWindDirection(element)).toBe(WIND_DIRECTION_A)
      expect(getWindGust(element)).toBe(WIND_GUST_A.toString())
      expect(getMaxTemp(element)).toContain(MAX_TEMP_A_FORMATTED)
      expect(getMinTemp(element)).toContain(MIN_TEMP_A_FORMATTED)
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
      mockFormatTemperature
        .mockReturnValueOnce(TEMP_A_FORMATTED)
        .mockReturnValueOnce(FEELS_LIKE_A_FORMATTED)
        .mockReturnValueOnce(MAX_TEMP_A_FORMATTED)
        .mockReturnValueOnce(MIN_TEMP_A_FORMATTED)

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

      mockFormatTemperature
        .mockReturnValueOnce(TEMP_A_FORMATTED)
        .mockReturnValueOnce(FEELS_LIKE_A_FORMATTED)
        .mockReturnValueOnce(MAX_TEMP_A_FORMATTED)
        .mockReturnValueOnce(MIN_TEMP_A_FORMATTED)
        .mockReturnValueOnce(TEMP_B_FORMATTED)
        .mockReturnValueOnce(FEELS_LIKE_B_FORMATTED)
        .mockReturnValueOnce(MAX_TEMP_B_FORMATTED)
        .mockReturnValueOnce(MIN_TEMP_B_FORMATTED)

      document.body.appendChild(element)
      ;(element as any)._weatherData = firstWeatherData
      await element.updateComplete

      // then
      expect(getTempNow(element)).toContain(TEMP_A_FORMATTED)
      expect(getFeelsLike(element)).toContain(FEELS_LIKE_A_FORMATTED)
      expect(getWindSpeed(element)).toContain(WIND_SPEED_A.toString())
      expect(getWindDirection(element)).toBe(WIND_DIRECTION_A)

      // when
      ;(element as any)._weatherData = secondWeatherData
      await element.updateComplete

      // then
      expect(getTempNow(element)).toContain(TEMP_B_FORMATTED)
      expect(getFeelsLike(element)).toContain(FEELS_LIKE_B_FORMATTED)
      expect(getWindSpeed(element)).toContain(WIND_SPEED_B.toString())
      expect(getWindDirection(element)).toBe(WIND_DIRECTION_B)
    })
  })
})
