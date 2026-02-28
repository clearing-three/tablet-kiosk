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

// Moon phase data and calculations
export interface MoonPhase {
  phase: number // Decimal value from 0 to 1 representing moon phase
  name: string // Human-readable phase name
  illumination: number // Percentage of moon illuminated
}

// Moon phase names enumeration
export enum MoonPhaseName {
  NEW_MOON = 'New Moon',
  WAXING_CRESCENT = 'Waxing Crescent',
  FIRST_QUARTER = 'First Quarter',
  WAXING_GIBBOUS = 'Waxing Gibbous',
  FULL_MOON = 'Full Moon',
  WANING_GIBBOUS = 'Waning Gibbous',
  LAST_QUARTER = 'Last Quarter',
  WANING_CRESCENT = 'Waning Crescent',
}

// SVG moon phase rendering data
export interface MoonPhaseSVGData {
  phase: number // Phase decimal value 0-1
  viewBox: string // SVG viewBox attribute value
  pathData: string // SVG path data for moon shape
  fillColor: string // Fill color for moon surface
}

// Moon phase service interface
export interface MoonPhaseServiceInterface {
  calculatePhase(date: Date): MoonPhase
  getPhaseName(phase: number): string
  generateSVG(phase: number): MoonPhaseSVGData
}
