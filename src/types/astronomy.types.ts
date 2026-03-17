/**
 * TypeScript interfaces for astronomical data and calculations
 *
 * These interfaces define structures for solar data (sunrise and sunset times)
 * and related astronomical data used throughout the application.
 */

// Solar times (sunrise and sunset) for a given day
export interface SolarTimes {
  sunrise: number // Unix timestamp
  sunset: number // Unix timestamp
}
