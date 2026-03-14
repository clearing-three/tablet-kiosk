/**
 * Weather Forecast Component
 *
 * Handles rendering and management of the 3-day weather forecast display.
 * Dynamically generates HTML for forecast days with proper typing and error handling.
 */

import type { ProcessedWeatherData } from '../../types/weather.types'

type ForecastDay = ProcessedWeatherData['forecast'][0]
import { createTemperatureRangeElements } from '../../utils/formatters'
import { WeatherService } from '../../services/WeatherService'

export class WeatherForecast {
  private weatherService: WeatherService
  private forecastContainer: HTMLElement

  constructor(weatherService: WeatherService) {
    const container = document.getElementById('forecast')
    if (!container) {
      throw new Error(
        'WeatherForecast: required element #forecast not found in DOM'
      )
    }

    this.weatherService = weatherService
    this.forecastContainer = container
  }

  /**
   * Creates HTML for a single forecast day
   * @param day Daily weather data
   * @returns HTMLDivElement containing the forecast day
   */
  private createForecastDayElement(
    day: ForecastDay
  ): globalThis.HTMLDivElement {
    const iconFile = this.weatherService.mapIconCodeToSVG(day.iconCode)

    const div = document.createElement('div')
    div.className = 'forecast-day'

    const dayName = document.createElement('div')
    dayName.className = 'forecast-day-name'
    dayName.textContent = day.dayName

    const icon = document.createElement('object')
    icon.type = 'image/svg+xml'
    icon.data = `weather-icons/${iconFile}.svg`
    icon.className = 'forecast-icon'

    const desc = document.createElement('div')
    desc.className = 'forecast-desc'
    desc.textContent = day.description

    const rangeContainer = document.createElement('div')
    rangeContainer.className = 'forecast-range'
    const rangeElements = createTemperatureRangeElements(
      day.maxTemp,
      day.minTemp
    )
    rangeContainer.appendChild(rangeElements)

    div.appendChild(dayName)
    div.appendChild(icon)
    div.appendChild(desc)
    div.appendChild(rangeContainer)

    return div
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
   * Clears the forecast container
   */
  private clearForecast(): void {
    this.forecastContainer.innerHTML = ''
  }

  /**
   * Updates the forecast display with new data
   * @param forecast Array of daily weather forecast data (next 3 days)
   */
  updateForecast(forecast: ForecastDay[]): void {
    this.validateForecastData(forecast)
    this.clearForecast()

    const forecastToShow = forecast.slice(0, 3)

    for (const day of forecastToShow) {
      const dayElement = this.createForecastDayElement(day)
      this.forecastContainer.appendChild(dayElement)
    }
  }

  /**
   * Gets the current number of forecast days displayed
   * @returns number Number of forecast days currently displayed
   */
  getForecastDayCount(): number {
    return this.forecastContainer.querySelectorAll('.forecast-day').length
  }
}
