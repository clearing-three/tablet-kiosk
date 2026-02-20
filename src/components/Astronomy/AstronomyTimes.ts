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
    try {
      this.elements.sunrise.textContent = formatTimeFromUnix(sunriseUnix)
    } catch (error) {
      console.error('Error formatting sunrise time:', error)
      this.elements.sunrise.textContent = '--'
    }
  }

  /**
   * Updates sunset time display
   * @param sunsetUnix Unix timestamp for sunset
   */
  private updateSunsetTime(sunsetUnix: number): void {
    try {
      this.elements.sunset.textContent = formatTimeFromUnix(sunsetUnix)
    } catch (error) {
      console.error('Error formatting sunset time:', error)
      this.elements.sunset.textContent = '--'
    }
  }

  /**
   * Updates moonrise time display
   * Shows "-" when moonrise is 0 (no moonrise that day)
   * @param moonriseUnix Unix timestamp for moonrise
   */
  private updateMoonriseTime(moonriseUnix: number): void {
    try {
      this.elements.moonrise.textContent =
        moonriseUnix === 0 ? '-' : formatTimeFromUnix(moonriseUnix)
    } catch (error) {
      console.error('Error formatting moonrise time:', error)
      this.elements.moonrise.textContent = '--'
    }
  }

  /**
   * Updates moonset time display
   * Shows "-" when moonset is 0 (no moonset that day)
   * @param moonsetUnix Unix timestamp for moonset
   */
  private updateMoonsetTime(moonsetUnix: number): void {
    try {
      this.elements.moonset.textContent =
        moonsetUnix === 0 ? '-' : formatTimeFromUnix(moonsetUnix)
    } catch (error) {
      console.error('Error formatting moonset time:', error)
      this.elements.moonset.textContent = '--'
    }
  }

  /**
   * Validates astronomy times data
   * @param astronomy Astronomy times data
   * @returns boolean True if data is valid
   */
  private validateAstronomyData(astronomy: AstronomyData): boolean {
    if (!astronomy) {
      console.error('Astronomy data is null or undefined')
      return false
    }

    // Check for required numeric properties
    const requiredProps = ['sunrise', 'sunset', 'moonrise', 'moonset']
    for (const prop of requiredProps) {
      if (typeof astronomy[prop as keyof AstronomyData] !== 'number') {
        console.error(`Invalid astronomy data: ${prop} is not a number`)
        return false
      }
    }

    // Validate that sunrise and sunset are reasonable timestamps (not 0)
    if (astronomy.sunrise <= 0 || astronomy.sunset <= 0) {
      console.error(
        'Invalid astronomy data: sunrise or sunset is zero or negative'
      )
      return false
    }

    return true
  }

  /**
   * Updates all astronomy time displays
   * @param astronomy Astronomy times data
   */
  updateTimes(astronomy: AstronomyData): void {
    try {
      // Validate input data
      if (!this.validateAstronomyData(astronomy)) {
        this.showErrorState()
        return
      }

      // Update all time displays
      this.updateSunriseTime(astronomy.sunrise)
      this.updateSunsetTime(astronomy.sunset)
      this.updateMoonriseTime(astronomy.moonrise)
      this.updateMoonsetTime(astronomy.moonset)
    } catch (error) {
      console.error('Error updating astronomy times:', error)
      this.showErrorState()
    }
  }

  /**
   * Shows error state for all astronomy time displays
   */
  private showErrorState(): void {
    this.elements.sunrise.textContent = '--'
    this.elements.sunset.textContent = '--'
    this.elements.moonrise.textContent = '--'
    this.elements.moonset.textContent = '--'
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
