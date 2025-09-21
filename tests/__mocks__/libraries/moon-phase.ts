/**
 * Mock for moon-phase.js library
 *
 * Provides predictable mock implementations of moon phase calculations
 * and SVG generation for testing purposes.
 */

/**
 * Mock moon phase calculation function
 * Replaces the global phase_junk function from moon-phase.js
 */
export function mockPhaseJunk(phaseDecimal: number): string {
  // Create predictable SVG path based on phase
  const radius = 50
  const centerX = 50
  const centerY = 50

  if (phaseDecimal === 0) {
    // New moon - dark circle
    return `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 1 0 ${centerX + radius} ${centerY} A ${radius} ${radius} 0 1 0 ${centerX - radius} ${centerY}`
  } else if (phaseDecimal === 0.25) {
    // First quarter - right half lit
    return `M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 0 1 ${centerX} ${centerY + radius} A ${radius / 2} ${radius} 0 0 0 ${centerX} ${centerY - radius}`
  } else if (phaseDecimal === 0.5) {
    // Full moon - full circle
    return `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX + radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX - radius} ${centerY}`
  } else if (phaseDecimal === 0.75) {
    // Last quarter - left half lit
    return `M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 0 0 ${centerX} ${centerY + radius} A ${radius / 2} ${radius} 0 0 1 ${centerX} ${centerY - radius}`
  } else {
    // Generic crescent shape for other phases
    const crescentWidth = Math.abs(0.5 - phaseDecimal) * radius * 2
    return `M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 0 1 ${centerX} ${centerY + radius} A ${crescentWidth} ${radius} 0 0 ${phaseDecimal > 0.5 ? 0 : 1} ${centerX} ${centerY - radius}`
  }
}

/**
 * Mock moon phase data for specific dates
 */
export const mockMoonPhaseData = {
  newMoon: {
    date: new Date('2022-01-01T00:00:00Z'),
    phase: 0.0,
    name: 'New Moon',
    illumination: 0,
  },
  waxingCrescent: {
    date: new Date('2022-01-08T00:00:00Z'),
    phase: 0.125,
    name: 'Waxing Crescent',
    illumination: 25,
  },
  firstQuarter: {
    date: new Date('2022-01-15T00:00:00Z'),
    phase: 0.25,
    name: 'First Quarter',
    illumination: 50,
  },
  waxingGibbous: {
    date: new Date('2022-01-22T00:00:00Z'),
    phase: 0.375,
    name: 'Waxing Gibbous',
    illumination: 75,
  },
  fullMoon: {
    date: new Date('2022-01-29T00:00:00Z'),
    phase: 0.5,
    name: 'Full Moon',
    illumination: 100,
  },
  waningGibbous: {
    date: new Date('2022-02-05T00:00:00Z'),
    phase: 0.625,
    name: 'Waning Gibbous',
    illumination: 75,
  },
  lastQuarter: {
    date: new Date('2022-02-12T00:00:00Z'),
    phase: 0.75,
    name: 'Last Quarter',
    illumination: 50,
  },
  waningCrescent: {
    date: new Date('2022-02-19T00:00:00Z'),
    phase: 0.875,
    name: 'Waning Crescent',
    illumination: 25,
  },
}

/**
 * Mock Julian date calculation
 */
export function mockGetJulian(date: Date): number {
  // Simplified Julian date calculation for testing
  return date.getTime() / 86400000 - date.getTimezoneOffset() / 1440 + 2440587.5
}

/**
 * Mock moon day calculation
 */
export function mockMoonDay(date: Date): number {
  // Return predictable moon phase based on date
  const dayOfMonth = date.getDate()

  // Cycle through phases based on day of month (roughly 4-week cycle)
  if (dayOfMonth <= 7) return 0.0 // New moon
  if (dayOfMonth <= 14) return 0.25 // First quarter
  if (dayOfMonth <= 21) return 0.5 // Full moon
  if (dayOfMonth <= 28) return 0.75 // Last quarter
  return 0.0 // Back to new moon
}

/**
 * Moon phase mock utility class
 */
export class MoonPhaseMock {
  private static originalPhaseJunk: any
  private static originalMoonDay: any

  /**
   * Set up mocks for moon phase functions
   */
  static setup() {
    // Store original functions if they exist
    if (typeof (global as any).phase_junk !== 'undefined') {
      this.originalPhaseJunk = (global as any).phase_junk
    }
    if (typeof (global as any).moon_day !== 'undefined') {
      this.originalMoonDay = (global as any).moon_day
    }

    // Replace with mocks
    ;(global as any).phase_junk = jest.fn(mockPhaseJunk)
    ;(global as any).moon_day = jest.fn(mockMoonDay)

    // Mock Date.prototype.getJulian if it exists
    if (typeof (Date.prototype as any).getJulian !== 'undefined') {
      ;(Date.prototype as any).getJulian = jest.fn(function (this: Date) {
        return mockGetJulian(this)
      })
    }
  }

  /**
   * Restore original functions
   */
  static teardown() {
    if (this.originalPhaseJunk) {
      ;(global as any).phase_junk = this.originalPhaseJunk
    } else {
      delete (global as any).phase_junk
    }

    if (this.originalMoonDay) {
      ;(global as any).moon_day = this.originalMoonDay
    } else {
      delete (global as any).moon_day
    }
  }

  /**
   * Mock specific moon phase
   */
  static mockPhase(phase: number, svgPath?: string) {
    const mockSvgPath = svgPath || mockPhaseJunk(phase)
    ;(global as any).phase_junk = jest.fn(() => mockSvgPath)
    ;(global as any).moon_day = jest.fn(() => phase)
  }

  /**
   * Mock moon phase for specific date
   */
  static mockPhaseForDate(date: Date, phase: number) {
    ;(global as any).moon_day = jest.fn((inputDate: Date) => {
      if (inputDate.getTime() === date.getTime()) {
        return phase
      }
      return mockMoonDay(inputDate)
    })
  }

  /**
   * Mock edge case scenarios
   */
  static mockEdgeCases() {
    // Mock invalid inputs
    ;(global as any).phase_junk = jest.fn((phase: number) => {
      if (typeof phase !== 'number' || isNaN(phase)) {
        return '' // Empty path for invalid input
      }
      if (phase < 0 || phase > 1) {
        return mockPhaseJunk(Math.max(0, Math.min(1, phase))) // Clamp to valid range
      }
      return mockPhaseJunk(phase)
    })
    ;(global as any).moon_day = jest.fn((date: any) => {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return 0 // Default to new moon for invalid dates
      }
      return mockMoonDay(date)
    })
  }

  /**
   * Verify moon phase function calls
   */
  static verifyPhaseJunkCalled(expectedPhase?: number) {
    expect((global as any).phase_junk).toHaveBeenCalled()
    if (expectedPhase !== undefined) {
      expect((global as any).phase_junk).toHaveBeenCalledWith(expectedPhase)
    }
  }

  static verifyMoonDayCalled(expectedDate?: Date) {
    expect((global as any).moon_day).toHaveBeenCalled()
    if (expectedDate) {
      expect((global as any).moon_day).toHaveBeenCalledWith(expectedDate)
    }
  }

  /**
   * Reset mocks
   */
  static reset() {
    if (
      (global as any).phase_junk &&
      jest.isMockFunction((global as any).phase_junk)
    ) {
      ;((global as any).phase_junk as jest.Mock).mockReset()
    }
    if (
      (global as any).moon_day &&
      jest.isMockFunction((global as any).moon_day)
    ) {
      ;((global as any).moon_day as jest.Mock).mockReset()
    }
  }
}

/**
 * Convenient helper functions for common moon phase testing scenarios
 */
export const moonPhaseTestHelpers = {
  // Set up new moon
  setupNewMoon: () => MoonPhaseMock.mockPhase(0.0),

  // Set up first quarter
  setupFirstQuarter: () => MoonPhaseMock.mockPhase(0.25),

  // Set up full moon
  setupFullMoon: () => MoonPhaseMock.mockPhase(0.5),

  // Set up last quarter
  setupLastQuarter: () => MoonPhaseMock.mockPhase(0.75),

  // Get expected SVG path for phase
  getExpectedSvgPath: (phase: number) => mockPhaseJunk(phase),

  // Get moon phase data for date
  getMoonPhaseData: (date: Date) => {
    const phase = mockMoonDay(date)
    const phases = Object.values(mockMoonPhaseData)
    return (
      phases.find(p => Math.abs(p.phase - phase) < 0.01) ||
      mockMoonPhaseData.newMoon
    )
  },
}
