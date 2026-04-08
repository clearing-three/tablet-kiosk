import type { WeatherData } from '../../src/types/weather-domain.types'
import { Forecast } from '../../src/elements/forecast'
import { temperatureDisplay } from '../../src/utils/formatters'

void Forecast

const DAY_1_NAME = 'Monday'
const DAY_1_ICON = 'clear-day'
const DAY_1_MAX = 75
const DAY_1_MIN = 60

const DAY_2_NAME = 'Tuesday'
const DAY_2_ICON = 'partly-cloudy-day'
const DAY_2_MAX = 78
const DAY_2_MIN = 62

const DAY_3_NAME = 'Wednesday'
const DAY_3_ICON = 'rain'
const DAY_3_MAX = 68
const DAY_3_MIN = 55

describe('forecast', () => {
  let element: Forecast

  const getForecastDays = (el: Forecast): NodeListOf<Element> => {
    return el.shadowRoot?.querySelectorAll('.forecast-day') ?? ([] as any)
  }

  const getDayName = (dayElement: Element): string => {
    return dayElement.querySelector('.forecast-day-name')?.textContent?.trim() ?? ''
  }

  const getIconPath = (dayElement: Element): string => {
    return dayElement.querySelector('.forecast-icon')?.getAttribute('data') ?? ''
  }

  const getMaxTemp = (dayElement: Element): string => {
    return dayElement.querySelector('.temp-high')?.textContent?.trim() ?? ''
  }

  const getMinTemp = (dayElement: Element): string => {
    return dayElement.querySelector('.temp-low')?.textContent?.trim() ?? ''
  }

  beforeEach(() => {
    element = document.createElement('x-forecast') as Forecast
  })

  afterEach(() => {
    if (element.isConnected) {
      element.remove()
    }
  })

  describe('rendering without weather data', () => {
    it('should render no forecast days when no weather data', async () => {
      // when
      document.body.appendChild(element)
      await element.updateComplete

      // then
      const days = getForecastDays(element)
      expect(days.length).toBe(0)
    })
  })

  describe('rendering with weather data', () => {
    it('should render 2 forecast days by default', async () => {
      // given
      const mockWeatherData: WeatherData = {
        current: {} as WeatherData['current'],
        forecast: [
          {
            dayName: DAY_1_NAME,
            icon: DAY_1_ICON,
            maxTemp: DAY_1_MAX,
            minTemp: DAY_1_MIN,
            description: 'Clear',
            date: new Date(),
          },
          {
            dayName: DAY_2_NAME,
            icon: DAY_2_ICON,
            maxTemp: DAY_2_MAX,
            minTemp: DAY_2_MIN,
            description: 'Partly Cloudy',
            date: new Date(),
          },
          {
            dayName: DAY_3_NAME,
            icon: DAY_3_ICON,
            maxTemp: DAY_3_MAX,
            minTemp: DAY_3_MIN,
            description: 'Rainy',
            date: new Date(),
          },
        ],
        astronomy: {} as WeatherData['astronomy'],
      }
      // when
      document.body.appendChild(element)
      ;(element as any)._weatherData = mockWeatherData
      await element.updateComplete

      // then
      const days = getForecastDays(element)
      expect(days.length).toBe(2)

      const day1Max = temperatureDisplay(DAY_1_MAX)
      const day1Min = temperatureDisplay(DAY_1_MIN)
      const day2Max = temperatureDisplay(DAY_2_MAX)
      const day2Min = temperatureDisplay(DAY_2_MIN)

      expect(getDayName(days[0]!)).toBe(DAY_1_NAME)
      expect(getIconPath(days[0]!)).toBe(`weather-icons/${DAY_1_ICON}.svg`)
      expect(getMaxTemp(days[0]!)).toContain(day1Max.text)
      expect(days[0]!.querySelector('.temp-high')?.getAttribute('style')).toContain(day1Max.color)
      expect(getMinTemp(days[0]!)).toContain(day1Min.text)
      expect(days[0]!.querySelector('.temp-low')?.getAttribute('style')).toContain(day1Min.color)

      expect(getDayName(days[1]!)).toBe(DAY_2_NAME)
      expect(getIconPath(days[1]!)).toBe(`weather-icons/${DAY_2_ICON}.svg`)
      expect(getMaxTemp(days[1]!)).toContain(day2Max.text)
      expect(days[1]!.querySelector('.temp-high')?.getAttribute('style')).toContain(day2Max.color)
      expect(getMinTemp(days[1]!)).toContain(day2Min.text)
      expect(days[1]!.querySelector('.temp-low')?.getAttribute('style')).toContain(day2Min.color)
    })

    it('should render custom number of forecast days', async () => {
      // given
      const mockWeatherData: WeatherData = {
        current: {} as WeatherData['current'],
        forecast: [
          {
            dayName: DAY_1_NAME,
            icon: DAY_1_ICON,
            maxTemp: DAY_1_MAX,
            minTemp: DAY_1_MIN,
            description: 'Clear',
            date: new Date(),
          },
          {
            dayName: DAY_2_NAME,
            icon: DAY_2_ICON,
            maxTemp: DAY_2_MAX,
            minTemp: DAY_2_MIN,
            description: 'Partly Cloudy',
            date: new Date(),
          },
          {
            dayName: DAY_3_NAME,
            icon: DAY_3_ICON,
            maxTemp: DAY_3_MAX,
            minTemp: DAY_3_MIN,
            description: 'Rainy',
            date: new Date(),
          },
        ],
        astronomy: {} as WeatherData['astronomy'],
      }
      element.days = 3

      // when
      document.body.appendChild(element)
      ;(element as any)._weatherData = mockWeatherData
      await element.updateComplete

      // then
      const days = getForecastDays(element)
      expect(days.length).toBe(3)
      expect(getDayName(days[2]!)).toBe(DAY_3_NAME)
      expect(getIconPath(days[2]!)).toBe(`weather-icons/${DAY_3_ICON}.svg`)
    })

    it('should update forecast when weather data changes', async () => {
      // given
      const firstWeatherData: WeatherData = {
        current: {} as WeatherData['current'],
        forecast: [
          {
            dayName: DAY_1_NAME,
            icon: DAY_1_ICON,
            maxTemp: DAY_1_MAX,
            minTemp: DAY_1_MIN,
            description: 'Clear',
            date: new Date(),
          },
          {
            dayName: DAY_2_NAME,
            icon: DAY_2_ICON,
            maxTemp: DAY_2_MAX,
            minTemp: DAY_2_MIN,
            description: 'Partly Cloudy',
            date: new Date(),
          },
        ],
        astronomy: {} as WeatherData['astronomy'],
      }
      const secondWeatherData: WeatherData = {
        current: {} as WeatherData['current'],
        forecast: [
          {
            dayName: DAY_3_NAME,
            icon: DAY_3_ICON,
            maxTemp: DAY_3_MAX,
            minTemp: DAY_3_MIN,
            description: 'Rainy',
            date: new Date(),
          },
        ],
        astronomy: {} as WeatherData['astronomy'],
      }

      document.body.appendChild(element)
      ;(element as any)._weatherData = firstWeatherData
      await element.updateComplete

      // then
      let days = getForecastDays(element)
      expect(days.length).toBe(2)
      expect(getDayName(days[0]!)).toBe(DAY_1_NAME)

      // when
      ;(element as any)._weatherData = secondWeatherData
      await element.updateComplete

      // then
      days = getForecastDays(element)
      expect(days.length).toBe(1)
      expect(getDayName(days[0]!)).toBe(DAY_3_NAME)
      expect(getIconPath(days[0]!)).toBe(`weather-icons/${DAY_3_ICON}.svg`)
    })
  })
})
