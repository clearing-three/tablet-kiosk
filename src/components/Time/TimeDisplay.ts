/**
 * Time Display Component
 *
 * Handles clock and date display management with interval-based updates.
 * Manages both current time and date formatting and display.
 */

import { formatCurrentTime, formatCurrentDate } from '../../utils/formatters'

export class TimeDisplay {
  private elements: {
    time?: HTMLElement
    date?: HTMLElement
  } = {}
  private updateInterval: number | null = null
  private readonly updateIntervalMs = 1000 // Update every second

  constructor() {
    this.initializeElements()
  }

  /**
   * Initialize DOM element references
   */
  private initializeElements(): void {
    this.elements = {
      time: document.getElementById('time') as HTMLElement,
      date: document.getElementById('date') as HTMLElement,
    }
  }

  /**
   * Updates the time display with current time
   */
  private updateTimeDisplay(): void {
    const { time } = this.elements
    if (!time) return

    try {
      const currentTime = formatCurrentTime()
      time.textContent = currentTime
    } catch (error) {
      console.error('Error updating time display:', error)
      time.textContent = '--:--'
    }
  }

  /**
   * Updates the date display with current date
   */
  private updateDateDisplay(): void {
    const { date } = this.elements
    if (!date) return

    try {
      const currentDate = formatCurrentDate()
      date.textContent = currentDate
    } catch (error) {
      console.error('Error updating date display:', error)
      date.textContent = 'Date unavailable'
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
   * Refreshes DOM element references (useful if DOM changes)
   */
  refreshElements(): void {
    this.initializeElements()
  }

  /**
   * Shows error state for time and date displays
   */
  showErrorState(): void {
    const { time, date } = this.elements

    if (time) time.textContent = '--:--'
    if (date) date.textContent = 'Date unavailable'
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
      time: this.elements.time?.textContent || null,
      date: this.elements.date?.textContent || null,
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
   * Checks if the time display elements are available
   * @returns boolean True if display elements are found
   */
  isInitialized(): boolean {
    return !!(this.elements.time && this.elements.date)
  }

  /**
   * Cleanup method to call when component is being destroyed
   */
  destroy(): void {
    this.stopUpdates()
  }
}
