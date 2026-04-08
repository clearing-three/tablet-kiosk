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

const COLOR_RANGES = [
  [100, 'var(--temp-extreme-heat)'],
  [90, 'var(--temp-very-hot)'],
  [80, 'var(--temp-hot)'],
  [70, 'var(--temp-warm)'],
  [60, 'var(--temp-comfortable)'],
  [50, 'var(--temp-mild)'],
  [40, 'var(--temp-cool)'],
  [30, 'var(--temp-cold)'],
  [20, 'var(--temp-freezing)'],
  [10, 'var(--temp-bitter)'],
  [0, 'var(--temp-arctic)'],
  [-Infinity, 'var(--temp-deep-freeze)'],
] as const

/**
 * Creates a temperature display object with formatted text and color
 * @param temp Temperature value as number or undefined
 * @returns Object with text (formatted temperature) and color (CSS variable)
 */
export function temperatureDisplay(temp: number | undefined): { text: string, color: string } {
  if (temp === undefined) {
    return { text: '', color: '' }
  }

  const color = COLOR_RANGES.find(([threshold]) => temp >= threshold)?.[1] ?? ''

  return {
    text: String(Math.round(temp)),
    color,
  }
}
