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
import { getElement } from '../../utils/dom'

export class WeatherDisplay {
  private weatherService: WeatherService
  private elements: {
    icon: HTMLObjectElement
    tempNow: HTMLElement
    description: HTMLElement
    range: HTMLElement
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
      icon: getElement<HTMLObjectElement>('weather-icon'),
      tempNow: getElement('temp-now'),
      description: getElement('weather-desc'),
      range: getElement('weather-range'),
    }
  }

  /**
   * Updates the weather icon display
   * @param iconCode OpenWeatherMap icon code
   * @param description Weather description for alt text
   */
  private updateWeatherIcon(iconCode: string, description: string): void {
    const iconFile = this.weatherService.mapIconCodeToSVG(iconCode)
    this.elements.icon.data = `weather-icons/${iconFile}.svg`
    this.elements.icon.setAttribute('alt', description)
  }

  /**
   * Updates the current temperature display
   * @param temperature Current temperature value
   */
  private updateCurrentTemperature(temperature: number): void {
    this.elements.tempNow.textContent = formatTemperatureDisplay(temperature)
  }

  /**
   * Updates the weather description display
   * @param description Weather condition description
   */
  private updateWeatherDescription(description: string): void {
    this.elements.description.textContent = description
  }

  /**
   * Updates the temperature range display (high/low)
   * @param maxTemp Maximum temperature
   * @param minTemp Minimum temperature
   */
  private updateTemperatureRange(maxTemp: number, minTemp: number): void {
    this.elements.range.textContent = formatTemperatureRange(maxTemp, minTemp)
  }

  /**
   * Updates all current weather display elements
   * @param currentWeather Current weather data
   */
  updateDisplay(currentWeather: CurrentWeatherDisplay): void {
    this.updateWeatherIcon(currentWeather.iconCode, currentWeather.description)
    this.updateCurrentTemperature(currentWeather.temperature)
    this.updateWeatherDescription(currentWeather.description)
    this.updateTemperatureRange(currentWeather.maxTemp, currentWeather.minTemp)
  }
}
