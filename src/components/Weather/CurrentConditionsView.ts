/**
 * Current Conditions View Component
 *
 * Renders current weather display elements in the UI.
 * Manages temperature and temperature range display.
 */

import type { WeatherData } from '../../types/weather-domain.types'

import { DOM_IDS } from '../../utils/constants'
import { getElement } from '../../utils/dom'
import {
  createTemperatureRangeElements,
  createWindSpeedElements,
  formatTemperature,
} from '../../utils/formatters'

type CurrentWeatherDisplay = WeatherData['current']

export class CurrentConditionsView {
  private elements: {
    tempNow: HTMLElement
    feelsLike: HTMLElement
    windDirection: HTMLElement
    windSpeed: HTMLElement
    range: HTMLElement
  }

  constructor() {
    this.elements = this.initializeElements()
  }

  /**
   * Initialize DOM element references. Throws if any required element is missing.
   */
  private initializeElements() {
    return {
      tempNow: getElement(DOM_IDS.TEMP_NOW),
      feelsLike: getElement(DOM_IDS.FEELS_LIKE),
      windDirection: getElement(DOM_IDS.WIND_DIRECTION),
      windSpeed: getElement(DOM_IDS.WIND_SPEED),
      range: getElement(DOM_IDS.WEATHER_RANGE),
    }
  }

  /**
   * Updates the current temperature display
   * @param temperature Current temperature value
   */
  private updateCurrentTemperature(temperature: number): void {
    this.elements.tempNow.textContent = formatTemperature(temperature)
  }

  /**
   * Updates the feels-like temperature display
   * @param feelsLike Feels-like temperature value
   */
  private updateFeelsLikeTemperature(feelsLike: number): void {
    this.elements.feelsLike.textContent = formatTemperature(feelsLike)
  }

  private updateWind(speed: number, direction: string, gust?: number): void {
    this.elements.windDirection.textContent = direction
    const speedElements = createWindSpeedElements(speed, gust)
    this.elements.windSpeed.replaceChildren(speedElements)
  }

  /**
   * Updates the temperature range display (high/low)
   * @param maxTemp Maximum temperature
   * @param minTemp Minimum temperature
   */
  private updateTemperatureRange(maxTemp: number, minTemp: number): void {
    const rangeElements = createTemperatureRangeElements(maxTemp, minTemp)
    this.elements.range.replaceChildren(rangeElements)
  }

  /**
   * Renders all current weather display elements
   * @param currentWeather Current weather data
   */
  render(currentWeather: CurrentWeatherDisplay): void {
    this.updateCurrentTemperature(currentWeather.temperature)
    this.updateFeelsLikeTemperature(currentWeather.feelsLike)
    this.updateWind(
      currentWeather.windSpeed,
      currentWeather.windDirection,
      currentWeather.windGust,
    )
    this.updateTemperatureRange(currentWeather.maxTemp, currentWeather.minTemp)
  }
}
