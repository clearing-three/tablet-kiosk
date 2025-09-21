/**
 * Moon Phase Service
 *
 * Service class for handling moon phase calculations and SVG rendering.
 * Provides a type-safe wrapper around the moon-phase.js library.
 */

import type {
  MoonPhase,
  MoonPhaseServiceInterface,
  MoonPhaseSVGData,
} from '../types/astronomy.types'
import { MoonPhaseName } from '../types/astronomy.types'

// Declare the global phase_junk function from moon-phase.js
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace globalThis {
    function phase_junk(phase: number): void
  }
}

export class MoonPhaseService implements MoonPhaseServiceInterface {
  /**
   * Calculate moon phase data for a given date
   * @param date Date to calculate moon phase for
   * @returns MoonPhase object with phase value, name, and illumination
   */
  calculatePhase(date: Date): MoonPhase {
    // Convert date to Julian day number for moon phase calculation
    const julianDay = this.dateToJulianDay(date)
    const phase = this.julianDayToMoonPhase(julianDay)

    return {
      phase,
      name: this.getPhaseName(phase),
      illumination: this.calculateIllumination(phase),
    }
  }

  /**
   * Get human-readable moon phase name from decimal phase value
   * @param phase Moon phase value from 0 to 1
   * @returns string Moon phase name
   */
  getPhaseName(phase: number): string {
    // Normalize phase to 0-1 range
    const normalizedPhase = phase % 1

    // Define phase boundaries
    if (normalizedPhase < 0.0625 || normalizedPhase >= 0.9375) {
      return MoonPhaseName.NEW_MOON
    } else if (normalizedPhase < 0.1875) {
      return MoonPhaseName.WAXING_CRESCENT
    } else if (normalizedPhase < 0.3125) {
      return MoonPhaseName.FIRST_QUARTER
    } else if (normalizedPhase < 0.4375) {
      return MoonPhaseName.WAXING_GIBBOUS
    } else if (normalizedPhase < 0.5625) {
      return MoonPhaseName.FULL_MOON
    } else if (normalizedPhase < 0.6875) {
      return MoonPhaseName.WANING_GIBBOUS
    } else if (normalizedPhase < 0.8125) {
      return MoonPhaseName.LAST_QUARTER
    } else {
      return MoonPhaseName.WANING_CRESCENT
    }
  }

  /**
   * Alternative method using the existing app logic for phase names
   * This matches the original describeMoonPhase function from app.js
   * @param phase Moon phase value from 0 to 1
   * @returns string Moon phase name
   */
  getPhaseNameLegacy(phase: number): string {
    const phases = [
      MoonPhaseName.NEW_MOON,
      MoonPhaseName.WAXING_CRESCENT,
      MoonPhaseName.FIRST_QUARTER,
      MoonPhaseName.WAXING_GIBBOUS,
      MoonPhaseName.FULL_MOON,
      MoonPhaseName.WANING_GIBBOUS,
      MoonPhaseName.LAST_QUARTER,
      MoonPhaseName.WANING_CRESCENT,
    ]
    const index = Math.floor(phase * 8) % 8
    return phases[index]
  }

  /**
   * Generate SVG data for moon phase visualization
   * This method integrates with the existing moon-phase.js library
   * @param phase Moon phase value from 0 to 1
   * @returns MoonPhaseSVGData SVG rendering data
   */
  generateSVG(phase: number): MoonPhaseSVGData {
    // Clear any existing moon SVG
    this.clearMoonSVG()

    // Use the existing phase_junk function to render the moon
    if (typeof globalThis.phase_junk === 'function') {
      globalThis.phase_junk(phase)
    } else {
      console.warn(
        'phase_junk function not available from moon-phase.js library'
      )
    }

    return {
      phase,
      viewBox: '0 0 200 200',
      pathData: '', // The phase_junk function directly manipulates the DOM
      fillColor: '#ffffff',
    }
  }

  /**
   * Update moon phase display in the DOM
   * @param phase Moon phase value from 0 to 1
   */
  updateMoonPhaseDisplay(phase: number): void {
    // Update phase name
    const phaseName = this.getPhaseNameLegacy(phase)
    const nameElement = document.getElementById('moon-phase-name')
    if (nameElement) {
      nameElement.textContent = phaseName
    }

    // Clear and render new SVG
    this.clearMoonSVG()

    // Set SVG attributes
    const svgElement = document.getElementById('moon')
    if (svgElement) {
      svgElement.setAttribute('viewBox', '0 0 200 200')
      svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    }

    // Render new moon phase using library
    if (typeof globalThis.phase_junk === 'function') {
      globalThis.phase_junk(phase)
    } else {
      console.error('Moon phase library (phase_junk) not available')
    }
  }

  /**
   * Clear existing moon SVG elements
   */
  private clearMoonSVG(): void {
    const container = document.getElementById('moon')
    if (container) {
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
    }
  }

  /**
   * Convert a Date object to Julian Day Number
   * @param date Date to convert
   * @returns number Julian Day Number
   */
  private dateToJulianDay(date: Date): number {
    const a = Math.floor((14 - (date.getMonth() + 1)) / 12)
    const y = date.getFullYear() + 4800 - a
    const m = date.getMonth() + 1 + 12 * a - 3

    return (
      date.getDate() +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045
    )
  }

  /**
   * Calculate moon phase from Julian Day Number
   * @param julianDay Julian Day Number
   * @returns number Moon phase value from 0 to 1
   */
  private julianDayToMoonPhase(julianDay: number): number {
    // Moon phase calculation based on astronomical formulas
    const daysSinceNewMoon = julianDay - 2451549.5 // J2000.0 epoch new moon
    const lunarMonths = daysSinceNewMoon / 29.53058867 // Average lunar month length
    return lunarMonths % 1
  }

  /**
   * Calculate moon illumination percentage from phase value
   * @param phase Moon phase value from 0 to 1
   * @returns number Illumination percentage from 0 to 100
   */
  private calculateIllumination(phase: number): number {
    // Illumination follows a cosine curve with phase
    const normalizedPhase = phase % 1
    if (normalizedPhase <= 0.5) {
      // Waxing: 0% to 100%
      return normalizedPhase * 200
    } else {
      // Waning: 100% to 0%
      return 200 - normalizedPhase * 200
    }
  }

  /**
   * Check if moon-phase.js library is available
   * @returns boolean True if library is loaded
   */
  isLibraryAvailable(): boolean {
    return typeof globalThis.phase_junk === 'function'
  }
}
