/**
 * Weather Forecast Component
 *
 * Handles rendering and management of the 2-day weather forecast display.
 * Updates static forecast day elements with weather data.
 */

import type { ProcessedWeatherData } from '../../types/weather.types'

type ForecastDay = ProcessedWeatherData['forecast'][0]
import { createTemperatureRangeElements } from '../../utils/formatters'
import { WeatherService } from '../../services/WeatherService'
import { getElement } from '../../utils/dom'
import { DOM_IDS } from '../../utils/constants'

export class WeatherForecast {
  private weatherService: WeatherService
  private elements: {
    day1: HTMLElement
    day2: HTMLElement
  }

  constructor(weatherService: WeatherService) {
    this.weatherService = weatherService
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
    day: ForecastDay
  ): void {
    const iconFile = this.weatherService.mapIconCodeToSVG(day.iconCode)

    const dayName = element.querySelector('.forecast-day-name')
    const icon = element.querySelector('.forecast-icon') as HTMLObjectElement
    const desc = element.querySelector('.forecast-desc')
    const rangeContainer = element.querySelector('.forecast-range')

    if (!dayName || !icon || !desc || !rangeContainer) {
      throw new Error('Forecast day element is missing required child elements')
    }

    dayName.textContent = day.dayName
    icon.data = `weather-icons/${iconFile}.svg`
    desc.textContent = day.description

    rangeContainer.innerHTML = ''
    const rangeElements = createTemperatureRangeElements(
      day.maxTemp,
      day.minTemp
    )
    rangeContainer.appendChild(rangeElements)
  }

  /**
   * Validates forecast data before rendering. Throws if data is invalid.
   * @param forecast Array of daily weather data
   */
  private validateForecastData(forecast: ForecastDay[]): void {
    if (!Array.isArray(forecast)) {
      throw new Error('Forecast data is not an array')
    }

    if (forecast.length === 0) {
      throw new Error('Forecast data is empty')
    }

    for (const day of forecast) {
      if (
        !day.dayName ||
        !day.iconCode ||
        !day.description ||
        typeof day.maxTemp !== 'number' ||
        typeof day.minTemp !== 'number'
      ) {
        throw new Error('Invalid forecast day data')
      }
    }
  }

  /**
   * Updates the forecast display with new data
   * @param forecast Array of daily weather forecast data (next 2 days)
   */
  updateForecast(forecast: ForecastDay[]): void {
    this.validateForecastData(forecast)

    const forecastToShow = forecast.slice(0, 2)
    const dayElements = [this.elements.day1, this.elements.day2]

    for (let i = 0; i < forecastToShow.length; i++) {
      this.updateForecastDayElement(dayElements[i], forecastToShow[i])
    }
  }

  /**
   * Gets the current number of forecast days displayed
   * @returns number Number of forecast days currently displayed
   */
  getForecastDayCount(): number {
    return 2
  }
}
