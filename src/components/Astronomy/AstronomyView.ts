/**
 * Astronomy View Component
 *
 * Renders sunrise and sunset times.
 */

import type { SolarTimes as AstronomyData } from '../../types/weather-domain.types'
import { formatTimeFromUnix } from '../../utils/formatters'
import { getElement } from '../../utils/dom'
import { DOM_IDS } from '../../utils/constants'

export class AstronomyView {
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
      sunrise: getElement(DOM_IDS.SUNRISE_TIME),
      sunset: getElement(DOM_IDS.SUNSET_TIME),
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
   * Renders all astronomy time displays
   * @param astronomy Astronomy times data
   */
  render(astronomy: AstronomyData): void {
    this.updateSunriseTime(astronomy.sunrise)
    this.updateSunsetTime(astronomy.sunset)
  }
}
