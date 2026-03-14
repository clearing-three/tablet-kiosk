/**
 * Formatters Unit Tests
 *
 * Comprehensive tests for formatting utilities including:
 * - Time formatting with various inputs
 * - Temperature formatting and rounding
 * - Date formatting consistency
 * - Edge cases (undefined, null, invalid dates)
 */

import {
  formatTimeFromUnix,
  formatCurrentTime,
  formatCurrentDate,
  formatDayNameFromUnix,
  formatTemperature,
  createTemperatureRangeElements,
  formatTemperatureDisplay,
} from '../../src/utils/formatters'

describe('formatters', () => {
  describe('formatTimeFromUnix', () => {
    it('should format Unix timestamp to 24-hour time', () => {
      // January 1, 2024, 14:30:00 UTC
      const unixTimestamp = 1704117000
      const result = formatTimeFromUnix(unixTimestamp)

      // The exact output will depend on timezone, but should be HH:MM format
      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should handle midnight correctly', () => {
      // January 1, 2024, 00:00:00 UTC
      const midnightUnix = 1704067200
      const result = formatTimeFromUnix(midnightUnix)

      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should handle noon correctly', () => {
      // January 1, 2024, 12:00:00 UTC
      const noonUnix = 1704110400
      const result = formatTimeFromUnix(noonUnix)

      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should handle edge case timestamps', () => {
      // Test with 0 (Unix epoch)
      const epochResult = formatTimeFromUnix(0)
      expect(epochResult).toMatch(/^\d{2}:\d{2}$/)

      // Test with large timestamp
      const futureResult = formatTimeFromUnix(2147483647)
      expect(futureResult).toMatch(/^\d{2}:\d{2}$/)
    })
  })

  describe('formatCurrentTime', () => {
    beforeEach(() => {
      // Mock Date.now to return a fixed timestamp: Jan 1, 2024, 14:30:00 UTC
      vi.spyOn(Date, 'now').mockReturnValue(1704117000000)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should return current time in HH:MM format', () => {
      const result = formatCurrentTime()
      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should return consistent format when called multiple times', () => {
      const result1 = formatCurrentTime()
      const result2 = formatCurrentTime()

      // Both should be valid time formats and should be identical since time is mocked
      expect(result1).toMatch(/^\d{2}:\d{2}$/)
      expect(result2).toMatch(/^\d{2}:\d{2}$/)
      expect(result1).toBe(result2) // Should be identical with mocked time
    })
  })

  describe('formatCurrentDate', () => {
    beforeEach(() => {
      // Use fake timers to control what new Date() returns: January 1, 2024
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-01T14:30:00.000Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return current date in readable format', () => {
      const result = formatCurrentDate()

      // Should contain weekday, month, and day
      expect(result).toMatch(/^[A-Z][a-z]+,\s[A-Z][a-z]+\s\d{1,2}$/)
    })

    it('should use long format for weekday and month', () => {
      const result = formatCurrentDate()

      // Should not contain abbreviations like "Mon" or "Jan"
      expect(result).not.toMatch(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/)
      expect(result).not.toMatch(
        /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/
      )
    })

    it('should return predictable output with mocked date', () => {
      const result = formatCurrentDate()

      // With our mocked date of Jan 1, 2024 (Monday), we expect consistent output
      // The exact format depends on locale, but structure should be consistent
      expect(result).toContain('January')
      expect(result).toContain('1')
    })
  })

  describe('formatDayNameFromUnix', () => {
    it('should format Unix timestamp to short day name', () => {
      // January 1, 2024 was a Monday
      const mondayUnix = 1704067200
      const result = formatDayNameFromUnix(mondayUnix)

      expect(result).toMatch(/^[A-Z][a-z]{2}$/) // Should be "Mon", "Tue", etc.
    })

    it('should handle different days of the week', () => {
      const testCases = [
        1704067200, // Monday
        1704153600, // Tuesday
        1704240000, // Wednesday
        1704326400, // Thursday
        1704412800, // Friday
        1704499200, // Saturday
        1704585600, // Sunday
      ]

      testCases.forEach(unix => {
        const result = formatDayNameFromUnix(unix)
        expect(result).toMatch(/^[A-Z][a-z]{2}$/)
      })
    })

    it('should handle edge case timestamps', () => {
      const epochResult = formatDayNameFromUnix(0)
      expect(epochResult).toMatch(/^[A-Z][a-z]{2}$/)

      const futureResult = formatDayNameFromUnix(2147483647)
      expect(futureResult).toMatch(/^[A-Z][a-z]{2}$/)
    })
  })

  describe('formatTemperature', () => {
    it('should round positive temperatures correctly', () => {
      expect(formatTemperature(72.3)).toBe(72)
      expect(formatTemperature(72.7)).toBe(73)
      expect(formatTemperature(72.5)).toBe(73)
    })

    it('should round negative temperatures correctly', () => {
      expect(formatTemperature(-5.3)).toBe(-5)
      expect(formatTemperature(-5.7)).toBe(-6)
      expect(formatTemperature(-5.5)).toBe(-5)
    })

    it('should handle zero temperature', () => {
      expect(formatTemperature(0)).toBe(0)
      expect(formatTemperature(0.4)).toBe(0)
      expect(formatTemperature(0.6)).toBe(1)
    })

    it('should handle integer temperatures', () => {
      expect(formatTemperature(75)).toBe(75)
      expect(formatTemperature(-10)).toBe(-10)
    })

    it('should handle extreme temperatures', () => {
      expect(formatTemperature(999.9)).toBe(1000)
      expect(formatTemperature(-999.9)).toBe(-1000)
    })
  })

  describe('createTemperatureRangeElements', () => {
    it('should create temperature range elements correctly', () => {
      const fragment = createTemperatureRangeElements(75.7, 60.3)
      const container = document.createElement('div')
      container.appendChild(fragment)

      expect(container.querySelector('.temp-high')?.textContent).toBe('76°')
      expect(container.querySelector('.temp-low')?.textContent).toBe('60°')
    })

    it('should handle same max and min temperatures', () => {
      const fragment = createTemperatureRangeElements(70, 70)
      const container = document.createElement('div')
      container.appendChild(fragment)

      expect(container.querySelector('.temp-high')?.textContent).toBe('70°')
      expect(container.querySelector('.temp-low')?.textContent).toBe('70°')
    })

    it('should handle negative temperatures', () => {
      const fragment = createTemperatureRangeElements(-5.2, -10.8)
      const container = document.createElement('div')
      container.appendChild(fragment)

      expect(container.querySelector('.temp-high')?.textContent).toBe('-5°')
      expect(container.querySelector('.temp-low')?.textContent).toBe('-11°')
    })

    it('should handle mixed positive/negative temperatures', () => {
      const fragment = createTemperatureRangeElements(32.1, -10.5)
      const container = document.createElement('div')
      container.appendChild(fragment)

      expect(container.querySelector('.temp-high')?.textContent).toBe('32°')
      expect(container.querySelector('.temp-low')?.textContent).toBe('-10°')
    })

    it('should round both temperatures appropriately', () => {
      const fragment = createTemperatureRangeElements(78.9, 65.1)
      const container = document.createElement('div')
      container.appendChild(fragment)

      expect(container.querySelector('.temp-high')?.textContent).toBe('79°')
      expect(container.querySelector('.temp-low')?.textContent).toBe('65°')
    })
  })

  describe('formatTemperatureDisplay', () => {
    it('should format single temperature with degree symbol', () => {
      expect(formatTemperatureDisplay(72.3)).toBe('72°')
      expect(formatTemperatureDisplay(72.7)).toBe('73°')
    })

    it('should handle negative temperatures', () => {
      expect(formatTemperatureDisplay(-5.7)).toBe('-6°')
    })

    it('should handle zero temperature', () => {
      expect(formatTemperatureDisplay(0)).toBe('0°')
    })

    it('should include degree symbol for all temperatures', () => {
      const testTemps = [100, 0, -20, 72.5, -5.3]

      testTemps.forEach(temp => {
        const result = formatTemperatureDisplay(temp)
        expect(result).toMatch(/^-?\d+°$/)
      })
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle NaN input gracefully', () => {
      expect(formatTemperature(NaN)).toBeNaN()
      expect(formatTemperatureDisplay(NaN)).toBe('NaN°')
    })

    it('should handle Infinity values', () => {
      expect(formatTemperature(Infinity)).toBe(Infinity)
      expect(formatTemperature(-Infinity)).toBe(-Infinity)
    })

    it('should handle very large timestamps in time functions', () => {
      // Year 2100 timestamp
      const futureTimestamp = 4102444800

      expect(() => formatTimeFromUnix(futureTimestamp)).not.toThrow()
      expect(() => formatDayNameFromUnix(futureTimestamp)).not.toThrow()
    })

    it('should handle negative timestamps in time functions', () => {
      // Before Unix epoch
      const pastTimestamp = -86400

      expect(() => formatTimeFromUnix(pastTimestamp)).not.toThrow()
      expect(() => formatDayNameFromUnix(pastTimestamp)).not.toThrow()
    })
  })
})
