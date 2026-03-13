/**
 * TypeScript interfaces for astronomical data and calculations
 *
 * These interfaces define structures for sunrise, sunset, moonrise, moonset times,
 * moon phase calculations, and related astronomical data used throughout the application.
 */

// Astronomical times for a given day
export interface AstronomyTimes {
  sunrise: number // Unix timestamp
  sunset: number // Unix timestamp
  moonrise: number // Unix timestamp (0 if no moonrise that day)
  moonset: number // Unix timestamp (0 if no moonset that day)
}

// Formatted astronomical times for display
export interface FormattedAstronomyTimes {
  sunrise: string // Formatted time string (HH:mm)
  sunset: string // Formatted time string (HH:mm)
  moonrise: string // Formatted time string (HH:mm) or "-"
  moonset: string // Formatted time string (HH:mm) or "-"
}
