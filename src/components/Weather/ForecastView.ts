/**
 * Forecast View Component
 *
 * Renders the 2-day weather forecast display.
 * Updates static forecast day elements with weather data.
 */

import type { WeatherData } from '../../types/weather-domain.types'
import { DOM_IDS } from '../../utils/constants'
import { getElement } from '../../utils/dom'
import { createTemperatureRangeElements } from '../../utils/formatters'

type ForecastDay = WeatherData['forecast'][0]

export const ERROR_MISSING_CHILD_ELEMENTS
  = 'Forecast day element is missing required child elements'

export class ForecastView {
  private elements: {
    day1: HTMLElement
    day2: HTMLElement
  }

  constructor() {
    this.elements = this.initializeElements()
  }

  /**
   * Initialize DOM element references. Throws if any required element is missing.
   */
  private initializeElements() {
    return {
      day1: getElement(DOM_IDS.FORECAST_DAY_1),
      day2: getElement(DOM_IDS.FORECAST_DAY_2),
    }
  }

  /**
   * Updates a single forecast day element with data
   * @param element The forecast day element to update
   * @param day Daily weather data
   */
  private updateForecastDayElement(
    element: HTMLElement,
    day: ForecastDay,
  ): void {
    const dayName = element.querySelector('.forecast-day-name')
    const icon = element.querySelector('.forecast-icon') as HTMLObjectElement
    const desc = element.querySelector('.forecast-desc')
    const rangeContainer = element.querySelector('.forecast-range')

    if (!dayName || !icon || !desc || !rangeContainer) {
      throw new Error(ERROR_MISSING_CHILD_ELEMENTS)
    }

    dayName.textContent = day.dayName
    icon.data = `weather-icons/${day.icon}.svg`
    desc.textContent = day.description

    rangeContainer.innerHTML = ''
    const rangeElements = createTemperatureRangeElements(
      day.maxTemp,
      day.minTemp,
    )
    rangeContainer.appendChild(rangeElements)
  }

  /**
   * Renders the forecast display with new data
   * @param forecast Array of daily weather forecast data (next 2 days)
   */
  render(forecast: ForecastDay[]): void {
    const dayElements = [this.elements.day1, this.elements.day2]
    const forecastToShow = forecast.slice(0, dayElements.length)

    for (let i = 0; i < forecastToShow.length; i++) {
      this.updateForecastDayElement(dayElements[i]!, forecastToShow[i]!)
    }
  }
}
