/**
 * Weather Forecast Component
 *
 * Handles rendering and management of the 3-day weather forecast display.
 * Dynamically generates HTML for forecast days with proper typing and error handling.
 */

import type { ProcessedWeatherData } from '../../types/weather.types'

type ForecastDay = ProcessedWeatherData['forecast'][0]
import { formatTemperatureRange } from '../../utils/formatters'
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
    const temperatureRange = formatTemperatureRange(day.maxTemp, day.minTemp)

    const div = document.createElement('div')
    div.className = 'forecast-day'

    div.innerHTML = `
      <div class="forecast-day-name">${day.dayName}</div>
      <object type="image/svg+xml" data="weather-icons/${iconFile}.svg" class="forecast-icon"></object>
      <div class="forecast-desc">${day.description}</div>
      <div class="forecast-range">${temperatureRange}</div>
    `

    return div
  }

  /**
   * Validates forecast data before rendering
   * @param forecast Array of daily weather data
   * @returns boolean True if data is valid for rendering
   */
  private validateForecastData(forecast: ForecastDay[]): boolean {
    if (!Array.isArray(forecast)) {
      console.error('Forecast data is not an array')
      return false
    }

    if (forecast.length === 0) {
      console.error('Forecast data is empty')
      return false
    }

    // Validate each forecast day has required properties
    for (const day of forecast) {
      if (
        !day.dayName ||
        !day.iconCode ||
        !day.description ||
        typeof day.maxTemp !== 'number' ||
        typeof day.minTemp !== 'number'
      ) {
        console.error('Invalid forecast day data:', day)
        return false
      }
    }

    return true
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
    try {
      // Validate forecast data
      if (!this.validateForecastData(forecast)) {
        this.showErrorState()
        return
      }

      // Clear existing forecast
      this.clearForecast()

      // Ensure we only show up to 3 days
      const forecastToShow = forecast.slice(0, 3)

      // Create and append forecast day elements
      for (const day of forecastToShow) {
        const dayElement = this.createForecastDayElement(day)
        this.forecastContainer.appendChild(dayElement)
      }
    } catch (error) {
      console.error('Error updating forecast display:', error)
      this.showErrorState()
    }
  }

  /**
   * Shows error state in the forecast display
   */
  private showErrorState(): void {
    this.clearForecast()

    const errorDiv = document.createElement('div')
    errorDiv.className = 'forecast-error'
    errorDiv.textContent = 'Forecast data unavailable'

    this.forecastContainer.appendChild(errorDiv)
  }

  /**
   * Gets the current number of forecast days displayed
   * @returns number Number of forecast days currently displayed
   */
  getForecastDayCount(): number {
    return this.forecastContainer.querySelectorAll('.forecast-day').length
  }
}
