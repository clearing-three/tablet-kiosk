/**
 * Astronomy Times Component
 *
 * Handles display of sunrise, sunset, moonrise, and moonset times.
 * Shows "-" for missing moon times (when moonrise/moonset is 0).
 */

import type { AstronomyTimes as AstronomyData } from '../../types/astronomy.types'
import { formatTimeFromUnix } from '../../utils/formatters'
import { getElement } from '../../utils/dom'

export class AstronomyTimes {
  private elements: {
    sunrise: HTMLElement
    sunset: HTMLElement
    moonrise: HTMLElement
    moonset: HTMLElement
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
      moonrise: getElement('moonrise-time'),
      moonset: getElement('moonset-time'),
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
   * Updates moonrise time display
   * Shows "-" when moonrise is 0 (no moonrise that day)
   * @param moonriseUnix Unix timestamp for moonrise
   */
  private updateMoonriseTime(moonriseUnix: number): void {
    this.elements.moonrise.textContent =
      moonriseUnix === 0 ? '-' : formatTimeFromUnix(moonriseUnix)
  }

  /**
   * Updates moonset time display
   * Shows "-" when moonset is 0 (no moonset that day)
   * @param moonsetUnix Unix timestamp for moonset
   */
  private updateMoonsetTime(moonsetUnix: number): void {
    this.elements.moonset.textContent =
      moonsetUnix === 0 ? '-' : formatTimeFromUnix(moonsetUnix)
  }

  /**
   * Validates astronomy times data. Throws if data is invalid.
   * @param astronomy Astronomy times data
   */
  private validateAstronomyData(astronomy: AstronomyData): void {
    if (!astronomy) {
      throw new Error('Astronomy data is null or undefined')
    }

    const requiredProps = ['sunrise', 'sunset', 'moonrise', 'moonset']
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
    this.updateMoonriseTime(astronomy.moonrise)
    this.updateMoonsetTime(astronomy.moonset)
  }

  /**
   * Gets the current astronomy time values from the DOM
   * @returns Object with current displayed time values
   */
  getCurrentDisplayValues(): {
    sunrise: string | null
    sunset: string | null
    moonrise: string | null
    moonset: string | null
  } {
    return {
      sunrise: this.elements.sunrise.textContent,
      sunset: this.elements.sunset.textContent,
      moonrise: this.elements.moonrise.textContent,
      moonset: this.elements.moonset.textContent,
    }
  }
}
