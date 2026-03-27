import type { Mock } from 'vitest'
import type { WeatherData } from '../../src/types/weather-domain.types'
import { SUN_ICON_PATH, SunTimes } from '../../src/elements/sun-times'
import * as formatters from '../../src/utils/formatters'

void SunTimes

const SUNRISE_A = 1
const SUNSET_A = 2
const SUNRISE_B = 3
const SUNSET_B = 4

const SUNRISE_A_TIME = '00:00'
const SUNSET_A_TIME = '00:01'
const SUNRISE_B_TIME = '00:02'
const SUNSET_B_TIME = '00:03'

describe('sun-times', () => {
  let element: SunTimes
  let mockFormatTimeFromUnix: Mock

  const getSunriseText = (el: SunTimes): string => {
    return el.shadowRoot?.querySelector('.sunrise-time')?.textContent?.trim() ?? ''
  }

  const getSunsetText = (el: SunTimes): string => {
    return el.shadowRoot?.querySelector('.sunset-time')?.textContent?.trim() ?? ''
  }

  const getSunIcon = (el: SunTimes): HTMLImageElement | null => {
    return el.shadowRoot?.querySelector('.sun-icon') ?? null
  }

  beforeEach(() => {
    mockFormatTimeFromUnix = vi.fn()
    vi.spyOn(formatters, 'formatTimeFromUnix').mockImplementation(
      mockFormatTimeFromUnix,
    )
    element = document.createElement('x-sun-times') as SunTimes
  })

  afterEach(() => {
    if (element.isConnected) {
      element.remove()
    }
    vi.restoreAllMocks()
  })

  describe('rendering without weather data', () => {
    it('should render when no weather data', async () => {
      // when
      document.body.appendChild(element)
      await element.updateComplete

      // then
      expect(getSunriseText(element)).toBe('')
      expect(getSunsetText(element)).toBe('')

      const icon = getSunIcon(element)
      expect(icon).not.toBeNull()
      expect(icon?.getAttribute('src')).toBe(SUN_ICON_PATH)
      expect(icon?.getAttribute('alt')).toBe('Sun')
    })
  })

  describe('rendering with weather data', () => {
    it('should render sunrise and sunset times', async () => {
      // given
      const mockWeatherData: WeatherData = {
        current: {} as WeatherData['current'],
        forecast: [],
        astronomy: {
          sunrise: SUNRISE_A,
          sunset: SUNSET_A,
        },
      }
      mockFormatTimeFromUnix
        .mockReturnValueOnce(SUNRISE_A_TIME)
        .mockReturnValueOnce(SUNSET_A_TIME)

      // when
      document.body.appendChild(element)
      ;(element as any)._weatherData = mockWeatherData
      await element.updateComplete

      // then
      expect(getSunriseText(element)).toContain(SUNRISE_A_TIME)
      expect(getSunsetText(element)).toContain(SUNSET_A_TIME)
    })

    it('should update times when weather data changes', async () => {
      // given
      const firstWeatherData: WeatherData = {
        current: {} as WeatherData['current'],
        forecast: [],
        astronomy: {
          sunrise: SUNRISE_A,
          sunset: SUNSET_A,
        },
      }
      const secondWeatherData: WeatherData = {
        current: {} as WeatherData['current'],
        forecast: [],
        astronomy: {
          sunrise: SUNRISE_B,
          sunset: SUNSET_B,
        },
      }

      mockFormatTimeFromUnix
        .mockReturnValueOnce(SUNRISE_A_TIME)
        .mockReturnValueOnce(SUNSET_A_TIME)
        .mockReturnValueOnce(SUNRISE_B_TIME)
        .mockReturnValueOnce(SUNSET_B_TIME)

      document.body.appendChild(element)
      ;(element as any)._weatherData = firstWeatherData
      await element.updateComplete

      // then
      expect(getSunriseText(element)).toContain(SUNRISE_A_TIME)
      expect(getSunsetText(element)).toContain(SUNSET_A_TIME)

      // when
      ;(element as any)._weatherData = secondWeatherData
      await element.updateComplete

      // then
      expect(getSunriseText(element)).toContain(SUNRISE_B_TIME)
      expect(getSunsetText(element)).toContain(SUNSET_B_TIME)
    })
  })
})
