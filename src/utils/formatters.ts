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
 * Formats temperature value by rounding to nearest integer
 * @param temp Temperature value as number
 * @returns Rounded temperature as string
 */
export function formatTemperature(temp: number): string {
  return String(Math.round(temp))
}
