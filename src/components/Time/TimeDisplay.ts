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
    try {
      this.elements.time.textContent = formatCurrentTime()
    } catch (error) {
      console.error('Error updating time display:', error)
      this.elements.time.textContent = '--:--'
    }
  }

  /**
   * Updates the date display with current date
   */
  private updateDateDisplay(): void {
    try {
      this.elements.date.textContent = formatCurrentDate()
    } catch (error) {
      console.error('Error updating date display:', error)
      this.elements.date.textContent = 'Date unavailable'
    }
  }

  /**
   * Updates both time and date displays
   */
  private updateDisplay(): void {
    this.updateTimeDisplay()
    this.updateDateDisplay()
  }

  /**
   * Starts the automatic time update interval
   */
  startUpdates(): void {
    // Clear any existing interval first
    this.stopUpdates()

    // Perform initial update
    this.updateDisplay()

    // Set up recurring updates
    this.updateInterval = window.setInterval(() => {
      this.updateDisplay()
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
   * Performs a one-time update of time and date displays
   */
  updateOnce(): void {
    this.updateDisplay()
  }

  /**
   * Shows error state for time and date displays
   */
  showErrorState(): void {
    this.elements.time.textContent = '--:--'
    this.elements.date.textContent = 'Date unavailable'
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
