/**
 * Astronomy Times Component
 *
 * Handles display of sunrise and sunset times.
 */

import type { SolarTimes as AstronomyData } from '../../types/astronomy.types'
import { formatTimeFromUnix } from '../../utils/formatters'
import { getElement } from '../../utils/dom'

export class AstronomyTimes {
  private elements: {
    sunrise: HTMLElement
    sunset: HTMLElement
  }

  constructor() {
    this.elements = this.initializeElements()
  }

  /**
   * Initialize DOM element references. Throws if any required element is missing.
   */
  private initializeElements() {
    return {
      sunrise: getElement('sunrise-time'),
      sunset: getElement('sunset-time'),
    }
  }

  /**
   * Updates sunrise time display
   * @param sunriseUnix Unix timestamp for sunrise
   */
  private updateSunriseTime(sunriseUnix: number): void {
    this.elements.sunrise.textContent = formatTimeFromUnix(sunriseUnix)
  }

  /**
   * Updates sunset time display
   * @param sunsetUnix Unix timestamp for sunset
   */
  private updateSunsetTime(sunsetUnix: number): void {
    this.elements.sunset.textContent = formatTimeFromUnix(sunsetUnix)
  }

  /**
   * Updates all astronomy time displays
   * @param astronomy Astronomy times data
   */
  updateTimes(astronomy: AstronomyData): void {
    this.updateSunriseTime(astronomy.sunrise)
    this.updateSunsetTime(astronomy.sunset)
  }
}
