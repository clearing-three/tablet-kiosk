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
 * Formats temperature range string for display
 * @param max Maximum temperature
 * @param min Minimum temperature
 * @returns Formatted temperature range string (e.g., "75° / 60°")
 */
export function formatTemperatureRange(max: number, min: number): string {
  const formattedMax = formatTemperature(max)
  const formattedMin = formatTemperature(min)
  return `${formattedMax}° / ${formattedMin}°`
}

/**
 * Formats a single temperature value for display
 * @param temp Temperature value
 * @returns Formatted temperature string with degree symbol (e.g., "72°")
 */
export function formatTemperatureDisplay(temp: number): string {
  return `${formatTemperature(temp)}°`
}

/**
 * Formats wind speed, direction, and optional gust for display
 * @param speed Wind speed in mph
 * @param direction 8-point cardinal direction (e.g., "NW")
 * @param gust Optional gust speed in mph
 * @returns Formatted wind string (e.g., "NW 12" or "NW 12 → 18")
 * Note: "mph" is added via CSS ::after pseudo-element
 */
export function formatWind(
  speed: number,
  direction: string,
  gust?: number
): string {
  const base = `${direction} ${speed}`
  return gust !== undefined ? `${base} → ${gust}` : base
}
