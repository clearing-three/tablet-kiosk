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
   * Validates astronomy times data. Throws if data is invalid.
   * @param astronomy Astronomy times data
   */
  private validateAstronomyData(astronomy: AstronomyData): void {
    if (!astronomy) {
      throw new Error('Astronomy data is null or undefined')
    }

    const requiredProps = ['sunrise', 'sunset']
    for (const prop of requiredProps) {
      if (typeof astronomy[prop as keyof AstronomyData] !== 'number') {
        throw new Error(`Invalid astronomy data: ${prop} is not a number`)
      }
    }

    if (astronomy.sunrise <= 0 || astronomy.sunset <= 0) {
      throw new Error(
        'Invalid astronomy data: sunrise or sunset is zero or negative'
      )
    }
  }

  /**
   * Updates all astronomy time displays
   * @param astronomy Astronomy times data
   */
  updateTimes(astronomy: AstronomyData): void {
    this.validateAstronomyData(astronomy)
    this.updateSunriseTime(astronomy.sunrise)
    this.updateSunsetTime(astronomy.sunset)
  }

  /**
   * Gets the current astronomy time values from the DOM
   * @returns Object with current displayed time values
   */
  getCurrentDisplayValues(): {
    sunrise: string | null
    sunset: string | null
  } {
    return {
      sunrise: this.elements.sunrise.textContent,
      sunset: this.elements.sunset.textContent,
    }
  }
}
