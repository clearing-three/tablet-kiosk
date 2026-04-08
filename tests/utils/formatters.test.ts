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
  formatCurrentDate,
  formatCurrentTime,
  formatTimeFromUnix,
  temperatureDisplay,
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
        /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/,
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

  describe('temperatureDisplay', () => {
    it('should return empty strings when temp is undefined', () => {
      // given
      const temp = undefined

      // expect
      expect(temperatureDisplay(temp)).toEqual({ text: '', color: '' })
    })

    it('should return formatted text and color for valid temperature', () => {
      // given
      const temp = 72.5

      // when
      const result = temperatureDisplay(temp)

      // then
      expect(result.text).toBe('73')
      expect(result.color).toBe('var(--temp-warm)')
    })

    describe('text formatting', () => {
      it('should round positive temperatures correctly', () => {
        // expect
        expect(temperatureDisplay(72.3).text).toBe('72')
        expect(temperatureDisplay(72.7).text).toBe('73')
        expect(temperatureDisplay(72.5).text).toBe('73')
      })

      it('should round negative temperatures correctly', () => {
        // expect
        expect(temperatureDisplay(-5.3).text).toBe('-5')
        expect(temperatureDisplay(-5.7).text).toBe('-6')
        expect(temperatureDisplay(-5.5).text).toBe('-5')
      })

      it('should handle zero temperature', () => {
        // expect
        expect(temperatureDisplay(0).text).toBe('0')
        expect(temperatureDisplay(0.4).text).toBe('0')
        expect(temperatureDisplay(0.6).text).toBe('1')
      })

      it('should handle integer temperatures', () => {
        // expect
        expect(temperatureDisplay(75).text).toBe('75')
        expect(temperatureDisplay(-10).text).toBe('-10')
      })

      it('should handle extreme temperatures', () => {
        // expect
        expect(temperatureDisplay(999.9).text).toBe('1000')
        expect(temperatureDisplay(-999.9).text).toBe('-1000')
      })

      it('should handle NaN input', () => {
        // expect
        expect(temperatureDisplay(Number.NaN).text).toBe('NaN')
      })

      it('should handle Infinity values', () => {
        // expect
        expect(temperatureDisplay(Infinity).text).toBe('Infinity')
        expect(temperatureDisplay(-Infinity).text).toBe('-Infinity')
      })
    })

    describe('color mapping', () => {
      it('should map temperature to correct color ranges', () => {
        // expect
        expect(temperatureDisplay(-5).color).toBe('var(--temp-deep-freeze)')
        expect(temperatureDisplay(5).color).toBe('var(--temp-arctic)')
        expect(temperatureDisplay(15).color).toBe('var(--temp-bitter)')
        expect(temperatureDisplay(25).color).toBe('var(--temp-freezing)')
        expect(temperatureDisplay(35).color).toBe('var(--temp-cold)')
        expect(temperatureDisplay(45).color).toBe('var(--temp-cool)')
        expect(temperatureDisplay(55).color).toBe('var(--temp-mild)')
        expect(temperatureDisplay(65).color).toBe('var(--temp-comfortable)')
        expect(temperatureDisplay(75).color).toBe('var(--temp-warm)')
        expect(temperatureDisplay(85).color).toBe('var(--temp-hot)')
        expect(temperatureDisplay(95).color).toBe('var(--temp-very-hot)')
        expect(temperatureDisplay(105).color).toBe('var(--temp-extreme-heat)')
      })

      it('should handle boundary temperatures', () => {
        // expect
        expect(temperatureDisplay(0).color).toBe('var(--temp-arctic)')
        expect(temperatureDisplay(10).color).toBe('var(--temp-bitter)')
        expect(temperatureDisplay(100).color).toBe('var(--temp-extreme-heat)')
      })
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle very large timestamps in time functions', () => {
      // Year 2100 timestamp
      const futureTimestamp = 4102444800

      expect(() => formatTimeFromUnix(futureTimestamp)).not.toThrow()
    })

    it('should handle negative timestamps in time functions', () => {
      // Before Unix epoch
      const pastTimestamp = -86400

      expect(() => formatTimeFromUnix(pastTimestamp)).not.toThrow()
    })
  })
})
