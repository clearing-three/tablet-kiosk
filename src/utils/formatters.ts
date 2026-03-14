/**
 * Formatting utilities for time, temperature, and date values
 */

/**
 * Formats a Unix timestamp to a 24-hour time string (HH:MM)
 * @param unix Unix timestamp in seconds
 * @returns Formatted time string in 24-hour format (e.g., "14:30")
 */
export function formatTimeFromUnix(unix: number): string {
  return new Date(unix * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Formats the current time to a 24-hour time string (HH:MM)
 * @returns Current time formatted as HH:MM
 */
export function formatCurrentTime(): string {
  return formatTimeFromUnix(Date.now() / 1000)
}

/**
 * Formats the current date to a readable string
 * @returns Formatted date string (e.g., "Monday, September 19")
 */
export function formatCurrentDate(): string {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }
  return now.toLocaleDateString(undefined, options)
}

/**
 * Formats a Unix timestamp to a short day name
 * @param unix Unix timestamp in seconds
 * @returns Short day name (e.g., "Mon", "Tue")
 */
export function formatDayNameFromUnix(unix: number): string {
  const dateObj = new Date(unix * 1000)
  return dateObj.toLocaleDateString(undefined, {
    weekday: 'short',
  })
}

/**
 * Formats temperature value by rounding to nearest integer
 * @param temp Temperature value as number
 * @returns Rounded temperature as number
 */
export function formatTemperature(temp: number): number {
  return Math.round(temp)
}

/**
 * Creates DOM elements for temperature range display with arrows
 * @param max Maximum temperature
 * @param min Minimum temperature
 * @returns DocumentFragment containing styled temperature range elements
 */
export function createTemperatureRangeElements(
  max: number,
  min: number
): DocumentFragment {
  const fragment = document.createDocumentFragment()

  const highSpan = document.createElement('span')
  highSpan.className = 'temp-high'
  highSpan.textContent = `${formatTemperature(max)}°`

  const lowSpan = document.createElement('span')
  lowSpan.className = 'temp-low'
  lowSpan.textContent = `${formatTemperature(min)}°`

  fragment.appendChild(highSpan)
  fragment.appendChild(document.createTextNode(' '))
  fragment.appendChild(lowSpan)

  return fragment
}

/**
 * Formats a single temperature value for display
 * @param temp Temperature value
 * @returns Formatted temperature string with degree symbol (e.g., "72°")
 */
export function formatTemperatureDisplay(temp: number): string {
  return `${formatTemperature(temp)}°`
}
