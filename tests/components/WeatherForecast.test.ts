/**
 * WeatherForecast Component Tests (3.5.2)
 *
 * Tests for WeatherForecast component covering:
 * - Forecast list generation
 * - Correct number of forecast days
 * - Proper date formatting for each day
 */

import { WeatherForecast } from '../../src/components/Weather/WeatherForecast'
import { WeatherService } from '../../src/services/WeatherService'
import type { ProcessedWeatherData } from '../../src/types/weather.types'

type ForecastDay = ProcessedWeatherData['forecast'][0]

const makeForecastDay = (
  overrides: Partial<ForecastDay> = {}
): ForecastDay => ({
  dayName: 'Mon',
  iconCode: '01d',
  description: 'clear sky',
  maxTemp: 75,
  minTemp: 58,
  date: new Date('2022-01-03'),
  ...overrides,
})

const THREE_DAYS: ForecastDay[] = [
  makeForecastDay({
    dayName: 'Mon',
    iconCode: '01d',
    description: 'clear sky',
    maxTemp: 75,
    minTemp: 58,
  }),
  makeForecastDay({
    dayName: 'Tue',
    iconCode: '02d',
    description: 'few clouds',
    maxTemp: 70,
    minTemp: 55,
  }),
  makeForecastDay({
    dayName: 'Wed',
    iconCode: '10d',
    description: 'light rain',
    maxTemp: 62,
    minTemp: 50,
  }),
]

describe('WeatherForecast', () => {
  let weatherForecast: WeatherForecast
  let mockWeatherService: Pick<WeatherService, 'mapIconCodeToSVG'>

  beforeEach(() => {
    document.body.innerHTML = '<div id="forecast"></div>'

    mockWeatherService = {
      mapIconCodeToSVG: jest.fn().mockReturnValue('clear-day'),
    }

    weatherForecast = new WeatherForecast(
      mockWeatherService as unknown as WeatherService
    )
  })

  describe('Constructor', () => {
    it('should throw when #forecast element is not in the DOM', () => {
      document.body.innerHTML = ''

      expect(
        () =>
          new WeatherForecast(mockWeatherService as unknown as WeatherService)
      ).toThrow('WeatherForecast: required element #forecast not found in DOM')
    })

    it('should construct successfully when #forecast element is present', () => {
      expect(
        () =>
          new WeatherForecast(mockWeatherService as unknown as WeatherService)
      ).not.toThrow()
    })
  })

  describe('Forecast list generation', () => {
    it('should create a forecast-day element for each day', () => {
      weatherForecast.updateForecast(THREE_DAYS)

      const days = document.querySelectorAll('.forecast-day')
      expect(days).toHaveLength(3)
    })

    it('should render the day name in each forecast-day element', () => {
      weatherForecast.updateForecast(THREE_DAYS)

      const dayNames = document.querySelectorAll('.forecast-day-name')
      expect(dayNames[0].textContent).toBe('Mon')
      expect(dayNames[1].textContent).toBe('Tue')
      expect(dayNames[2].textContent).toBe('Wed')
    })

    it('should render the description in each forecast-day element', () => {
      weatherForecast.updateForecast(THREE_DAYS)

      const descs = document.querySelectorAll('.forecast-desc')
      expect(descs[0].textContent).toBe('clear sky')
      expect(descs[1].textContent).toBe('few clouds')
      expect(descs[2].textContent).toBe('light rain')
    })

    it('should render the temperature range in each forecast-day element', () => {
      weatherForecast.updateForecast(THREE_DAYS)

      const ranges = document.querySelectorAll('.forecast-range')
      expect(ranges[0].textContent).toBe('75° / 58°')
      expect(ranges[1].textContent).toBe('70° / 55°')
      expect(ranges[2].textContent).toBe('62° / 50°')
    })

    it('should set the icon SVG path using the mapped icon code', () => {
      ;(mockWeatherService.mapIconCodeToSVG as jest.Mock)
        .mockReturnValueOnce('clear-day')
        .mockReturnValueOnce('partly-cloudy')
        .mockReturnValueOnce('rain')

      weatherForecast.updateForecast(THREE_DAYS)

      const icons = document.querySelectorAll('.forecast-icon')
      expect((icons[0] as HTMLObjectElement).data).toContain(
        'weather-icons/clear-day.svg'
      )
      expect((icons[1] as HTMLObjectElement).data).toContain(
        'weather-icons/partly-cloudy.svg'
      )
      expect((icons[2] as HTMLObjectElement).data).toContain(
        'weather-icons/rain.svg'
      )
    })

    it('should call mapIconCodeToSVG with the correct icon code for each day', () => {
      weatherForecast.updateForecast(THREE_DAYS)

      expect(mockWeatherService.mapIconCodeToSVG).toHaveBeenCalledWith('01d')
      expect(mockWeatherService.mapIconCodeToSVG).toHaveBeenCalledWith('02d')
      expect(mockWeatherService.mapIconCodeToSVG).toHaveBeenCalledWith('10d')
    })

    it('should clear previous forecast before rendering new one', () => {
      weatherForecast.updateForecast(THREE_DAYS)
      expect(document.querySelectorAll('.forecast-day')).toHaveLength(3)

      weatherForecast.updateForecast([makeForecastDay()])
      expect(document.querySelectorAll('.forecast-day')).toHaveLength(1)
    })
  })

  describe('Correct number of forecast days', () => {
    it('should display all 3 days when given exactly 3', () => {
      weatherForecast.updateForecast(THREE_DAYS)

      expect(getForecastDays()).toHaveLength(3)
    })

    it('should display only 3 days when given more than 3', () => {
      const fiveDays = [
        ...THREE_DAYS,
        makeForecastDay({ dayName: 'Thu' }),
        makeForecastDay({ dayName: 'Fri' }),
      ]

      weatherForecast.updateForecast(fiveDays)

      expect(getForecastDays()).toHaveLength(3)
    })

    it('should display 1 day when given only 1', () => {
      weatherForecast.updateForecast([makeForecastDay()])

      expect(getForecastDays()).toHaveLength(1)
    })

    it('should report the correct count via getForecastDayCount', () => {
      weatherForecast.updateForecast(THREE_DAYS)

      expect(weatherForecast.getForecastDayCount()).toBe(3)
    })
  })

  describe('Proper date formatting for each day', () => {
    it('should render day names exactly as provided', () => {
      const days = [
        makeForecastDay({ dayName: 'Monday' }),
        makeForecastDay({ dayName: 'Tuesday' }),
        makeForecastDay({ dayName: 'Wednesday' }),
      ]

      weatherForecast.updateForecast(days)

      const dayNames = document.querySelectorAll('.forecast-day-name')
      expect(dayNames[0].textContent).toBe('Monday')
      expect(dayNames[1].textContent).toBe('Tuesday')
      expect(dayNames[2].textContent).toBe('Wednesday')
    })

    it('should format temperature ranges as "max° / min°"', () => {
      const days = [makeForecastDay({ maxTemp: 82, minTemp: 61 })]

      weatherForecast.updateForecast(days)

      expect(document.querySelector('.forecast-range')!.textContent).toBe(
        '82° / 61°'
      )
    })

    it('should round fractional temperatures in the range display', () => {
      const days = [makeForecastDay({ maxTemp: 78.7, minTemp: 61.3 })]

      weatherForecast.updateForecast(days)

      expect(document.querySelector('.forecast-range')!.textContent).toBe(
        '79° / 61°'
      )
    })

    it('should handle negative temperatures in the range display', () => {
      const days = [makeForecastDay({ maxTemp: -5, minTemp: -18 })]

      weatherForecast.updateForecast(days)

      expect(document.querySelector('.forecast-range')!.textContent).toBe(
        '-5° / -18°'
      )
    })
  })

  describe('Validation and error handling', () => {
    it('should show error state when forecast is not an array', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      weatherForecast.updateForecast(null as any)

      expect(document.querySelector('.forecast-error')).not.toBeNull()
      consoleSpy.mockRestore()
    })

    it('should show error state when forecast array is empty', () => {
      weatherForecast.updateForecast([])

      expect(document.querySelector('.forecast-error')).not.toBeNull()
      expect(document.querySelector('.forecast-error')!.textContent).toBe(
        'Forecast data unavailable'
      )
      expect(getForecastDays()).toHaveLength(0)
    })

    it('should show error state when a day is missing dayName', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const invalid = [makeForecastDay({ dayName: '' })]

      weatherForecast.updateForecast(invalid)

      expect(document.querySelector('.forecast-error')).not.toBeNull()
      consoleSpy.mockRestore()
    })

    it('should show error state when a day is missing iconCode', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const invalid = [makeForecastDay({ iconCode: '' })]

      weatherForecast.updateForecast(invalid)

      expect(document.querySelector('.forecast-error')).not.toBeNull()
      consoleSpy.mockRestore()
    })

    it('should show error state when a day is missing description', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const invalid = [makeForecastDay({ description: '' })]

      weatherForecast.updateForecast(invalid)

      expect(document.querySelector('.forecast-error')).not.toBeNull()
      consoleSpy.mockRestore()
    })

    it('should show error state when mapIconCodeToSVG throws', () => {
      ;(mockWeatherService.mapIconCodeToSVG as jest.Mock).mockImplementation(
        () => {
          throw new Error('mapping failed')
        }
      )

      weatherForecast.updateForecast(THREE_DAYS)

      expect(document.querySelector('.forecast-error')).not.toBeNull()
      expect(getForecastDays()).toHaveLength(0)
    })
  })
})

function getForecastDays(): NodeListOf<Element> {
  return document.querySelectorAll('.forecast-day')
}
