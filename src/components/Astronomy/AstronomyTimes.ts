/**
 * Astronomy Times Component
 *
 * Handles display of sunrise, sunset, moonrise, and moonset times.
 * Shows "-" for missing moon times (when moonrise/moonset is 0).
 */

import type { AstronomyTimes as AstronomyData } from '../../types/astronomy.types'
import { formatTimeFromUnix } from '../../utils/formatters'

export class AstronomyTimes {
  private elements: {
    sunrise?: HTMLElement
    sunset?: HTMLElement
    moonrise?: HTMLElement
    moonset?: HTMLElement
  } = {}

  constructor() {
    this.initializeElements()
  }

  /**
   * Initialize DOM element references
   */
  private initializeElements(): void {
    this.elements = {
      sunrise: document.getElementById('sunrise-time') as HTMLElement,
      sunset: document.getElementById('sunset-time') as HTMLElement,
      moonrise: document.getElementById('moonrise-time') as HTMLElement,
      moonset: document.getElementById('moonset-time') as HTMLElement,
    }
  }

  /**
   * Updates sunrise time display
   * @param sunriseUnix Unix timestamp for sunrise
   */
  private updateSunriseTime(sunriseUnix: number): void {
    const { sunrise } = this.elements
    if (!sunrise) return

    try {
      sunrise.textContent = formatTimeFromUnix(sunriseUnix)
    } catch (error) {
      console.error('Error formatting sunrise time:', error)
      sunrise.textContent = '--'
    }
  }

  /**
   * Updates sunset time display
   * @param sunsetUnix Unix timestamp for sunset
   */
  private updateSunsetTime(sunsetUnix: number): void {
    const { sunset } = this.elements
    if (!sunset) return

    try {
      sunset.textContent = formatTimeFromUnix(sunsetUnix)
    } catch (error) {
      console.error('Error formatting sunset time:', error)
      sunset.textContent = '--'
    }
  }

  /**
   * Updates moonrise time display
   * Shows "-" when moonrise is 0 (no moonrise that day)
   * @param moonriseUnix Unix timestamp for moonrise
   */
  private updateMoonriseTime(moonriseUnix: number): void {
    const { moonrise } = this.elements
    if (!moonrise) return

    try {
      if (moonriseUnix === 0) {
        moonrise.textContent = '-'
      } else {
        moonrise.textContent = formatTimeFromUnix(moonriseUnix)
      }
    } catch (error) {
      console.error('Error formatting moonrise time:', error)
      moonrise.textContent = '--'
    }
  }

  /**
   * Updates moonset time display
   * Shows "-" when moonset is 0 (no moonset that day)
   * @param moonsetUnix Unix timestamp for moonset
   */
  private updateMoonsetTime(moonsetUnix: number): void {
    const { moonset } = this.elements
    if (!moonset) return

    try {
      if (moonsetUnix === 0) {
        moonset.textContent = '-'
      } else {
        moonset.textContent = formatTimeFromUnix(moonsetUnix)
      }
    } catch (error) {
      console.error('Error formatting moonset time:', error)
      moonset.textContent = '--'
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
    const { sunrise, sunset, moonrise, moonset } = this.elements

    if (sunrise) sunrise.textContent = '--'
    if (sunset) sunset.textContent = '--'
    if (moonrise) moonrise.textContent = '--'
    if (moonset) moonset.textContent = '--'
  }

  /**
   * Refreshes DOM element references (useful if DOM changes)
   */
  refreshElements(): void {
    this.initializeElements()
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
      sunrise: this.elements.sunrise?.textContent || null,
      sunset: this.elements.sunset?.textContent || null,
      moonrise: this.elements.moonrise?.textContent || null,
      moonset: this.elements.moonset?.textContent || null,
    }
  }
}
