/**
 * Time Display Component
 *
 * Handles clock and date display management with interval-based updates.
 * Manages both current time and date formatting and display.
 */

import { formatCurrentTime, formatCurrentDate } from '../../utils/formatters'
import { getElement } from '../../utils/dom'

export class TimeDisplay {
  private elements: {
    time: HTMLElement
    date: HTMLElement
  }
  private updateInterval: number | null = null
  private readonly updateIntervalMs = 1000 // Update every second

  constructor() {
    this.elements = this.initializeElements()
  }

  /**
   * Initialize DOM element references. Throws if any required element is missing.
   */
  private initializeElements() {
    return {
      time: getElement('time'),
      date: getElement('date'),
    }
  }

  /**
   * Updates the time display with current time
   */
  private updateTimeDisplay(): void {
    this.elements.time.textContent = formatCurrentTime()
  }

  /**
   * Updates the date display with current date
   */
  private updateDateDisplay(): void {
    this.elements.date.textContent = formatCurrentDate()
  }

  /**
   * Updates both time and date displays
   */
  updateDisplay(): void {
    this.updateTimeDisplay()
    this.updateDateDisplay()
  }

  /**
   * Starts the automatic time update interval
   */
  startUpdates(
    onError?: (error: unknown) => void,
    onSuccess?: () => void
  ): void {
    this.stopUpdates()
    this.updateDisplay()

    let lastUpdateFailed = false
    this.updateInterval = window.setInterval(() => {
      try {
        this.updateDisplay()
        if (lastUpdateFailed) {
          lastUpdateFailed = false
          onSuccess?.()
        }
      } catch (error) {
        lastUpdateFailed = true
        onError?.(error)
      }
    }, this.updateIntervalMs)
  }

  /**
   * Stops the automatic time update interval
   */
  stopUpdates(): void {
    if (this.updateInterval !== null) {
      window.clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  /**
   * Gets the current time and date values from the display
   * @returns Object with current displayed time and date values
   */
  getCurrentDisplayValues(): {
    time: string | null
    date: string | null
  } {
    return {
      time: this.elements.time.textContent,
      date: this.elements.date.textContent,
    }
  }

  /**
   * Checks if automatic updates are currently running
   * @returns boolean True if updates are active
   */
  isUpdating(): boolean {
    return this.updateInterval !== null
  }

  /**
   * Gets the current update interval in milliseconds
   * @returns number Update interval in milliseconds
   */
  getUpdateInterval(): number {
    return this.updateIntervalMs
  }

  /**
   * Cleanup method to call when component is being destroyed
   */
  destroy(): void {
    this.stopUpdates()
  }
}
