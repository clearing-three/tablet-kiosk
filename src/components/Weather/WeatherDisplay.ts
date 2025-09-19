/**
 * Weather Display Component
 *
 * Handles updating current weather display elements in the UI.
 * Manages temperature, description, icon, and temperature range display.
 */

import type { ProcessedWeatherData } from '../../types/weather.types'

type CurrentWeatherDisplay = ProcessedWeatherData['current']
import {
  formatTemperatureDisplay,
  formatTemperatureRange,
} from '../../utils/formatters'
import { WeatherService } from '../../services/WeatherService'

export class WeatherDisplay {
  private weatherService: WeatherService
  private elements: {
    icon?: HTMLObjectElement
    tempNow?: HTMLElement
    description?: HTMLElement
    range?: HTMLElement
  } = {}

  constructor(weatherService: WeatherService) {
    this.weatherService = weatherService
    this.initializeElements()
  }

  /**
   * Initialize DOM element references
   */
  private initializeElements(): void {
    this.elements = {
      icon: document.getElementById('weather-icon') as HTMLObjectElement,
      tempNow: document.getElementById('temp-now') as HTMLElement,
      description: document.getElementById('weather-desc') as HTMLElement,
      range: document.getElementById('weather-range') as HTMLElement,
    }
  }

  /**
   * Updates the weather icon display
   * @param iconCode OpenWeatherMap icon code
   * @param description Weather description for alt text
   */
  private updateWeatherIcon(iconCode: string, description: string): void {
    const { icon } = this.elements
    if (!icon) return

    const iconFile = this.weatherService.mapIconCodeToSVG(iconCode)
    icon.data = `weather-icons/${iconFile}.svg`
    icon.setAttribute('alt', description)
  }

  /**
   * Updates the current temperature display
   * @param temperature Current temperature value
   */
  private updateCurrentTemperature(temperature: number): void {
    const { tempNow } = this.elements
    if (!tempNow) return

    tempNow.textContent = formatTemperatureDisplay(temperature)
  }

  /**
   * Updates the weather description display
   * @param description Weather condition description
   */
  private updateWeatherDescription(description: string): void {
    const { description: descElement } = this.elements
    if (!descElement) return

    descElement.textContent = description
  }

  /**
   * Updates the temperature range display (high/low)
   * @param maxTemp Maximum temperature
   * @param minTemp Minimum temperature
   */
  private updateTemperatureRange(maxTemp: number, minTemp: number): void {
    const { range } = this.elements
    if (!range) return

    range.textContent = formatTemperatureRange(maxTemp, minTemp)
  }

  /**
   * Updates all current weather display elements
   * @param currentWeather Current weather data
   */
  updateDisplay(currentWeather: CurrentWeatherDisplay): void {
    try {
      this.updateWeatherIcon(
        currentWeather.iconCode,
        currentWeather.description
      )
      this.updateCurrentTemperature(currentWeather.temperature)
      this.updateWeatherDescription(currentWeather.description)
      this.updateTemperatureRange(
        currentWeather.maxTemp,
        currentWeather.minTemp
      )
    } catch (error) {
      console.error('Error updating weather display:', error)
      this.showErrorState()
    }
  }

  /**
   * Shows error state in the weather display
   */
  private showErrorState(): void {
    const { tempNow, description, range } = this.elements

    if (tempNow) tempNow.textContent = '--°'
    if (description) description.textContent = 'Weather data unavailable'
    if (range) range.textContent = '--° / --°'
  }

  /**
   * Refreshes DOM element references (useful if DOM changes)
   */
  refreshElements(): void {
    this.initializeElements()
  }
}
