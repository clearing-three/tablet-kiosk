/**
 * ForecastView Component Tests (3.5.2)
 *
 * Tests for ForecastView component covering:
 * - Forecast list generation (2-day forecast)
 * - Correct number of forecast days
 * - Proper date formatting for each day
 */

import type { WeatherData } from '../../src/types/weather-domain.types'
import {
  ERROR_MISSING_CHILD_ELEMENTS,
  ForecastView,
} from '../../src/components/Weather/ForecastView'

type ForecastDay = WeatherData['forecast'][0]

function makeForecastDay(overrides: Partial<ForecastDay> = {}): ForecastDay {
  return {
    dayName: 'Mon',
    icon: 'clear-day',
    description: 'clear sky',
    maxTemp: 75,
    minTemp: 58,
    date: new Date('2022-01-03'),
    ...overrides,
  }
}

const THREE_DAYS: ForecastDay[] = [
  makeForecastDay({
    dayName: 'Mon',
    icon: 'clear-day',
    description: 'clear sky',
    maxTemp: 75,
    minTemp: 58,
  }),
  makeForecastDay({
    dayName: 'Tue',
    icon: 'partly-cloudy-day',
    description: 'few clouds',
    maxTemp: 70,
    minTemp: 55,
  }),
  makeForecastDay({
    dayName: 'Wed',
    icon: 'rain',
    description: 'light rain',
    maxTemp: 62,
    minTemp: 50,
  }),
]

describe('forecastView', () => {
  let forecastView: ForecastView

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="forecast">
        <div id="forecast-day-1" class="forecast-day">
          <div class="forecast-day-name"></div>
          <object type="image/svg+xml" class="forecast-icon"></object>
          <div class="forecast-desc"></div>
          <div class="forecast-range"></div>
        </div>
        <div id="forecast-day-2" class="forecast-day">
          <div class="forecast-day-name"></div>
          <object type="image/svg+xml" class="forecast-icon"></object>
          <div class="forecast-desc"></div>
          <div class="forecast-range"></div>
        </div>
      </div>
    `

    forecastView = new ForecastView()
  })

  describe('constructor', () => {
    it('should throw when forecast day elements are not in the DOM', () => {
      document.body.innerHTML = ''

      expect(() => new ForecastView()).toThrow(
        'Required DOM element not found: #forecast-day-1',
      )
    })

    it('should construct successfully when #forecast element is present', () => {
      expect(() => new ForecastView()).not.toThrow()
    })
  })

  describe('forecast list generation', () => {
    it('should create a forecast-day element for each day', () => {
      forecastView.render(THREE_DAYS)

      const days = document.querySelectorAll('.forecast-day')
      expect(days).toHaveLength(2)
    })

    it('should render the day name in each forecast-day element', () => {
      forecastView.render(THREE_DAYS)

      const dayNames = document.querySelectorAll('.forecast-day-name')
      expect(dayNames[0]!.textContent).toBe('Mon')
      expect(dayNames[1]!.textContent).toBe('Tue')
    })

    it('should render the description in each forecast-day element', () => {
      forecastView.render(THREE_DAYS)

      const descs = document.querySelectorAll('.forecast-desc')
      expect(descs[0]!.textContent).toBe('clear sky')
      expect(descs[1]!.textContent).toBe('few clouds')
    })

    it('should render the temperature range in each forecast-day element', () => {
      forecastView.render(THREE_DAYS)

      const ranges = document.querySelectorAll('.forecast-range')
      expect(ranges[0]!.querySelector('.temp-high')?.textContent).toBe('75')
      expect(ranges[0]!.querySelector('.temp-low')?.textContent).toBe('58')
      expect(ranges[1]!.querySelector('.temp-high')?.textContent).toBe('70')
      expect(ranges[1]!.querySelector('.temp-low')?.textContent).toBe('55')
    })

    it('should set the icon SVG path using the icon name', () => {
      forecastView.render(THREE_DAYS)

      const icons = document.querySelectorAll('.forecast-icon')
      expect((icons[0] as HTMLObjectElement).data).toContain(
        'weather-icons/clear-day.svg',
      )
      expect((icons[1] as HTMLObjectElement).data).toContain(
        'weather-icons/partly-cloudy-day.svg',
      )
    })

    it('should update previous forecast with new data', () => {
      forecastView.render(THREE_DAYS)
      const firstDayName
        = document.querySelector('.forecast-day-name')?.textContent
      expect(firstDayName).toBe('Mon')

      const newForecast = [
        makeForecastDay({ dayName: 'Sat' }),
        makeForecastDay({ dayName: 'Sun' }),
      ]
      forecastView.render(newForecast)
      const updatedDayName
        = document.querySelector('.forecast-day-name')?.textContent
      expect(updatedDayName).toBe('Sat')
    })
  })

  describe('correct number of forecast days', () => {
    it('should display only 2 days when given 3 or more', () => {
      forecastView.render(THREE_DAYS)

      expect(getForecastDays()).toHaveLength(2)
    })

    it('should display only 2 days when given more than 2', () => {
      const fiveDays = [
        ...THREE_DAYS,
        makeForecastDay({ dayName: 'Thu' }),
        makeForecastDay({ dayName: 'Fri' }),
      ]

      forecastView.render(fiveDays)

      expect(getForecastDays()).toHaveLength(2)
    })

    it('should update only first day when given only 1', () => {
      forecastView.render([makeForecastDay({ dayName: 'Thu' })])

      const dayNames = document.querySelectorAll('.forecast-day-name')
      expect(dayNames[0]!.textContent).toBe('Thu')
    })
  })

  describe('proper date formatting for each day', () => {
    it('should render day names exactly as provided', () => {
      const days = [
        makeForecastDay({ dayName: 'Monday' }),
        makeForecastDay({ dayName: 'Tuesday' }),
        makeForecastDay({ dayName: 'Wednesday' }),
      ]

      forecastView.render(days)

      const dayNames = document.querySelectorAll('.forecast-day-name')
      expect(dayNames[0]!.textContent).toBe('Monday')
      expect(dayNames[1]!.textContent).toBe('Tuesday')
    })

    it('should format temperature ranges with styled high/low spans', () => {
      const days = [makeForecastDay({ maxTemp: 82, minTemp: 61 })]

      forecastView.render(days)

      const rangeEl = document.querySelector('.forecast-range')!
      expect(rangeEl.querySelector('.temp-high')?.textContent).toBe('82')
      expect(rangeEl.querySelector('.temp-low')?.textContent).toBe('61')
    })

    it('should round fractional temperatures in the range display', () => {
      const days = [makeForecastDay({ maxTemp: 78.7, minTemp: 61.3 })]

      forecastView.render(days)

      const rangeEl = document.querySelector('.forecast-range')!
      expect(rangeEl.querySelector('.temp-high')?.textContent).toBe('79')
      expect(rangeEl.querySelector('.temp-low')?.textContent).toBe('61')
    })

    it('should handle negative temperatures in the range display', () => {
      const days = [makeForecastDay({ maxTemp: -5, minTemp: -18 })]

      forecastView.render(days)

      const rangeEl = document.querySelector('.forecast-range')!
      expect(rangeEl.querySelector('.temp-high')?.textContent).toBe('-5')
      expect(rangeEl.querySelector('.temp-low')?.textContent).toBe('-18')
    })
  })

  describe('validation and error propagation', () => {
    it.each([
      '.forecast-day-name',
      '.forecast-icon',
      '.forecast-desc',
      '.forecast-range',
    ])('should throw when %s is missing', (selector) => {
      document.querySelector(selector)?.remove()

      expect(() => forecastView.render(THREE_DAYS)).toThrow(
        ERROR_MISSING_CHILD_ELEMENTS,
      )
    })
  })
})

function getForecastDays(): NodeListOf<Element> {
  return document.querySelectorAll('.forecast-day')
}
