/**
 * Time Service
 *
 * Service class for handling time formatting, clock updates, and time-related utilities.
 * Manages interval-based updates and provides consistent time formatting throughout the app.
 */

import type { FormattedAstronomyTimes } from '../types/astronomy.types'
import type { TimeServiceConfig } from '../types/service-config.types'

export class TimeService {
  private clockInterval: NodeJS.Timeout | null = null
  private weatherInterval: NodeJS.Timeout | null = null
  private readonly clockUpdateInterval: number
  private readonly weatherUpdateInterval: number
  private readonly config: TimeServiceConfig

  constructor(config: TimeServiceConfig) {
    this.config = config
    this.clockUpdateInterval = config.clockUpdateInterval
    this.weatherUpdateInterval = config.weatherUpdateInterval
  }

  /**
   * Format Unix timestamp to HH:mm format in 24-hour time
   * @param unixTimestamp Unix timestamp in seconds
   * @returns string Formatted time string (HH:mm)
   */
  formatTimeFromUnix(unixTimestamp: number): string {
    const date = new Date(unixTimestamp * 1000)
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  /**
   * Format current date and time for display
   * @returns object Current time and date formatted for display
   */
  getCurrentTimeAndDate(): { time: string; date: string } {
    const now = new Date()

    // Format time as HH:mm
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const time = `${hours}:${minutes}`

    // Format date as "Day, Month Date"
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }
    const date = now.toLocaleDateString(undefined, dateOptions)

    return { time, date }
  }

  /**
   * Update the time and date display in the DOM
   */
  updateTimeAndDateDisplay(): void {
    const { time, date } = this.getCurrentTimeAndDate()

    const timeElement = document.getElementById('time')
    const dateElement = document.getElementById('date')

    if (timeElement) {
      timeElement.textContent = time
    }

    if (dateElement) {
      dateElement.textContent = date
    }
  }

  /**
   * Format astronomy times for display
   * @param times Object containing Unix timestamps for astronomical times
   * @returns FormattedAstronomyTimes Formatted times for display
   */
  formatAstronomyTimes(times: {
    sunrise: number
    sunset: number
    moonrise: number
    moonset: number
  }): FormattedAstronomyTimes {
    return {
      sunrise: this.formatTimeFromUnix(times.sunrise),
      sunset: this.formatTimeFromUnix(times.sunset),
      moonrise:
        times.moonrise === 0 ? '-' : this.formatTimeFromUnix(times.moonrise),
      moonset:
        times.moonset === 0 ? '-' : this.formatTimeFromUnix(times.moonset),
    }
  }

  /**
   * Update astronomy times display in the DOM
   * @param times Object containing Unix timestamps for astronomical times
   */
  updateAstronomyTimesDisplay(times: {
    sunrise: number
    sunset: number
    moonrise: number
    moonset: number
  }): void {
    const formattedTimes = this.formatAstronomyTimes(times)

    const sunriseElement = document.getElementById('sunrise-time')
    const sunsetElement = document.getElementById('sunset-time')
    const moonriseElement = document.getElementById('moonrise-time')
    const moonsetElement = document.getElementById('moonset-time')

    if (sunriseElement) {
      sunriseElement.textContent = formattedTimes.sunrise
    }

    if (sunsetElement) {
      sunsetElement.textContent = formattedTimes.sunset
    }

    if (moonriseElement) {
      moonriseElement.textContent = formattedTimes.moonrise
    }

    if (moonsetElement) {
      moonsetElement.textContent = formattedTimes.moonset
    }
  }

  /**
   * Start the clock update interval
   * @param callback Optional callback to execute on each update
   */
  startClockUpdates(callback?: () => void): void {
    // Stop any existing interval
    this.stopClockUpdates()

    // Update immediately
    this.updateTimeAndDateDisplay()
    if (callback) {
      callback()
    }

    // Set up recurring updates
    this.clockInterval = setInterval(() => {
      this.updateTimeAndDateDisplay()
      if (callback) {
        callback()
      }
    }, this.clockUpdateInterval)
  }

  /**
   * Stop the clock update interval
   */
  stopClockUpdates(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval)
      this.clockInterval = null
    }
  }

  /**
   * Start the weather update interval
   * @param callback Function to execute on each weather update
   */
  startWeatherUpdates(callback: () => void | Promise<void>): void {
    // Stop any existing interval
    this.stopWeatherUpdates()

    // Update immediately
    const executeCallback = async () => {
      try {
        await callback()
      } catch (error) {
        console.error('Weather update callback failed:', error)
      }
    }

    executeCallback()

    // Set up recurring updates
    this.weatherInterval = setInterval(
      executeCallback,
      this.weatherUpdateInterval
    )
  }

  /**
   * Stop the weather update interval
   */
  stopWeatherUpdates(): void {
    if (this.weatherInterval) {
      clearInterval(this.weatherInterval)
      this.weatherInterval = null
    }
  }

  /**
   * Stop all intervals
   */
  stopAllIntervals(): void {
    this.stopClockUpdates()
    this.stopWeatherUpdates()
  }

  /**
   * Get current interval settings
   * @returns object Current interval configuration
   */
  getIntervalSettings(): {
    clockUpdateInterval: number
    weatherUpdateInterval: number
  } {
    return {
      clockUpdateInterval: this.clockUpdateInterval,
      weatherUpdateInterval: this.weatherUpdateInterval,
    }
  }

  /**
   * Check if intervals are currently running
   * @returns object Status of each interval
   */
  getIntervalStatus(): {
    clockRunning: boolean
    weatherRunning: boolean
  } {
    return {
      clockRunning: this.clockInterval !== null,
      weatherRunning: this.weatherInterval !== null,
    }
  }

  /**
   * Get the current configuration
   * @returns TimeServiceConfig Current service configuration
   */
  getConfig(): TimeServiceConfig {
    return { ...this.config }
  }

  /**
   * Format a duration in milliseconds to human-readable format
   * @param milliseconds Duration in milliseconds
   * @returns string Human-readable duration
   */
  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  /**
   * Get time until next update for each interval
   * @returns object Time remaining until next updates
   */
  getTimeUntilNextUpdate(): {
    clockUpdate: string
    weatherUpdate: string
  } {
    const clockMs = this.clockUpdateInterval
    const weatherMs = this.weatherUpdateInterval

    return {
      clockUpdate: this.formatDuration(clockMs),
      weatherUpdate: this.formatDuration(weatherMs),
    }
  }
}
