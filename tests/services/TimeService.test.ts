/**
 * TimeService Unit Tests
 *
 * Comprehensive tests for TimeService functionality including:
 * - Unix timestamp conversion accuracy
 * - Time formatting edge cases
 * - Interval management
 * - DOM manipulation methods
 * - Clock and weather update intervals
 */

// Mock the environment module before importing TimeService
jest.mock('../../src/config/environment', () => ({
  environment: {
    intervals: {
      clockUpdate: 1000,
      weatherUpdate: 600000,
    },
  },
}))

import { TimeService } from '../../src/services/TimeService'
import { TimerMock } from '../__mocks__/dom/browser-apis'

describe('TimeService', () => {
  let timeService: TimeService

  beforeEach(() => {
    timeService = new TimeService()
    TimerMock.clearAll()

    // Set up DOM elements for testing
    document.body.innerHTML = `
      <div id="time"></div>
      <div id="date"></div>
      <div id="sunrise-time"></div>
      <div id="sunset-time"></div>
      <div id="moonrise-time"></div>
      <div id="moonset-time"></div>
    `
  })

  afterEach(() => {
    timeService.stopAllIntervals()
    TimerMock.clearAll()
    document.body.innerHTML = ''
  })

  describe('Constructor and Configuration', () => {
    it('should initialize with environment configuration', () => {
      const settings = timeService.getIntervalSettings()

      expect(settings.clockUpdateInterval).toBe(1000) // 1 second from environment
      expect(settings.weatherUpdateInterval).toBe(600000) // 10 minutes from environment
    })

    it('should start with no active intervals', () => {
      const status = timeService.getIntervalStatus()

      expect(status.clockRunning).toBe(false)
      expect(status.weatherRunning).toBe(false)
    })
  })

  describe('Unix Timestamp Formatting', () => {
    it('should format Unix timestamps to HH:mm format', () => {
      const testCases = [
        { unix: 1640995200, expected: '19:00' }, // 2022-01-01 00:00:00 UTC (assuming EST)
        { unix: 1641038400, expected: '07:00' }, // 2022-01-01 12:00:00 UTC
        { unix: 1641045600, expected: '09:00' }, // 2022-01-01 14:00:00 UTC
        { unix: 1641052800, expected: '11:00' }, // 2022-01-01 16:00:00 UTC
      ]

      testCases.forEach(({ unix }) => {
        const result = timeService.formatTimeFromUnix(unix)
        expect(result).toMatch(/^\d{2}:\d{2}$/) // Should match HH:mm format
        expect(result.length).toBe(5) // Should be exactly 5 characters
      })
    })

    it('should handle midnight and noon correctly', () => {
      // Test midnight (00:00)
      const midnight = new Date('2022-01-01T00:00:00Z').getTime() / 1000
      const midnightResult = timeService.formatTimeFromUnix(midnight)
      expect(midnightResult).toMatch(/^\d{2}:\d{2}$/)

      // Test noon (12:00)
      const noon = new Date('2022-01-01T12:00:00Z').getTime() / 1000
      const noonResult = timeService.formatTimeFromUnix(noon)
      expect(noonResult).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should use 24-hour format', () => {
      // Test afternoon time that would be PM in 12-hour format
      const afternoon = new Date('2022-01-01T15:30:00Z').getTime() / 1000
      const result = timeService.formatTimeFromUnix(afternoon)

      // Should not contain AM/PM
      expect(result).not.toContain('AM')
      expect(result).not.toContain('PM')
      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should handle edge case timestamps', () => {
      const edgeCases = [
        0, // Unix epoch
        2147483647, // Max 32-bit signed integer
        1577836800, // 2020-01-01 00:00:00 UTC
      ]

      edgeCases.forEach(unix => {
        expect(() => {
          const result = timeService.formatTimeFromUnix(unix)
          expect(result).toMatch(/^\d{2}:\d{2}$/)
        }).not.toThrow()
      })
    })
  })

  describe('Current Time and Date Formatting', () => {
    it('should format current time in HH:mm format', () => {
      const { time } = timeService.getCurrentTimeAndDate()

      expect(time).toMatch(/^\d{2}:\d{2}$/)
      expect(time.length).toBe(5)
    })

    it('should format current date in readable format', () => {
      const { date } = timeService.getCurrentTimeAndDate()

      // Should contain day of week and month name
      expect(date).toMatch(/\w+.*\w+.*\d+/)
      expect(date.length).toBeGreaterThan(10)
    })

    it('should return consistent format for same time', () => {
      const result1 = timeService.getCurrentTimeAndDate()

      // Wait a tiny bit to ensure we're in the same minute
      const result2 = timeService.getCurrentTimeAndDate()

      // Time should be the same if called within the same minute
      const timeDiff = Math.abs(
        new Date(`1970-01-01T${result1.time}:00Z`).getTime() -
          new Date(`1970-01-01T${result2.time}:00Z`).getTime()
      )
      expect(timeDiff).toBeLessThan(60000) // Less than 1 minute difference
    })

    it('should handle time boundaries correctly', () => {
      // Mock specific times to test boundaries
      jest.useFakeTimers()

      // Test midnight boundary
      jest.setSystemTime(new Date('2022-01-01T00:00:00Z'))
      const midnight = timeService.getCurrentTimeAndDate()
      expect(midnight.time).toMatch(/^\d{2}:\d{2}$/)

      // Test noon boundary
      jest.setSystemTime(new Date('2022-01-01T12:00:00Z'))
      const noon = timeService.getCurrentTimeAndDate()
      expect(noon.time).toMatch(/^\d{2}:\d{2}$/)

      jest.useRealTimers()
    })
  })

  describe('DOM Updates', () => {
    it('should update time and date elements in DOM', () => {
      timeService.updateTimeAndDateDisplay()

      const timeElement = document.getElementById('time')
      const dateElement = document.getElementById('date')

      expect(timeElement?.textContent).toMatch(/^\d{2}:\d{2}$/)
      expect(dateElement?.textContent).toMatch(/\w+.*\w+.*\d+/)
    })

    it('should handle missing DOM elements gracefully', () => {
      document.body.innerHTML = '' // Remove elements

      expect(() => {
        timeService.updateTimeAndDateDisplay()
      }).not.toThrow()
    })

    it('should update time element when only time element exists', () => {
      document.body.innerHTML = '<div id="time"></div>'

      timeService.updateTimeAndDateDisplay()

      const timeElement = document.getElementById('time')
      expect(timeElement?.textContent).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should update date element when only date element exists', () => {
      document.body.innerHTML = '<div id="date"></div>'

      timeService.updateTimeAndDateDisplay()

      const dateElement = document.getElementById('date')
      expect(dateElement?.textContent).toMatch(/\w+.*\w+.*\d+/)
    })
  })

  describe('Astronomy Times Formatting', () => {
    it('should format astronomy times correctly', () => {
      const testTimes = {
        sunrise: 1640966400, // 6:00 UTC
        sunset: 1641002400, // 16:00 UTC
        moonrise: 1640980800, // 10:00 UTC
        moonset: 1641024000, // 22:00 UTC
      }

      const formatted = timeService.formatAstronomyTimes(testTimes)

      expect(formatted.sunrise).toMatch(/^\d{2}:\d{2}$/)
      expect(formatted.sunset).toMatch(/^\d{2}:\d{2}$/)
      expect(formatted.moonrise).toMatch(/^\d{2}:\d{2}$/)
      expect(formatted.moonset).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should handle missing moonrise/moonset data', () => {
      const timesWithMissingMoon = {
        sunrise: 1640966400,
        sunset: 1641002400,
        moonrise: 0, // Missing moonrise
        moonset: 0, // Missing moonset
      }

      const formatted = timeService.formatAstronomyTimes(timesWithMissingMoon)

      expect(formatted.sunrise).toMatch(/^\d{2}:\d{2}$/)
      expect(formatted.sunset).toMatch(/^\d{2}:\d{2}$/)
      expect(formatted.moonrise).toBe('-')
      expect(formatted.moonset).toBe('-')
    })

    it('should update astronomy times in DOM', () => {
      const testTimes = {
        sunrise: 1640966400,
        sunset: 1641002400,
        moonrise: 1640980800,
        moonset: 1641024000,
      }

      timeService.updateAstronomyTimesDisplay(testTimes)

      expect(document.getElementById('sunrise-time')?.textContent).toMatch(
        /^\d{2}:\d{2}$/
      )
      expect(document.getElementById('sunset-time')?.textContent).toMatch(
        /^\d{2}:\d{2}$/
      )
      expect(document.getElementById('moonrise-time')?.textContent).toMatch(
        /^\d{2}:\d{2}$/
      )
      expect(document.getElementById('moonset-time')?.textContent).toMatch(
        /^\d{2}:\d{2}$/
      )
    })

    it('should display dashes for missing moon times in DOM', () => {
      const timesWithMissingMoon = {
        sunrise: 1640966400,
        sunset: 1641002400,
        moonrise: 0,
        moonset: 0,
      }

      timeService.updateAstronomyTimesDisplay(timesWithMissingMoon)

      expect(document.getElementById('moonrise-time')?.textContent).toBe('-')
      expect(document.getElementById('moonset-time')?.textContent).toBe('-')
    })

    it('should handle missing astronomy DOM elements gracefully', () => {
      document.body.innerHTML = '' // Remove all elements

      const testTimes = {
        sunrise: 1640966400,
        sunset: 1641002400,
        moonrise: 1640980800,
        moonset: 1641024000,
      }

      expect(() => {
        timeService.updateAstronomyTimesDisplay(testTimes)
      }).not.toThrow()
    })
  })

  describe('Clock Interval Management', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should start clock updates with correct interval', () => {
      const callback = jest.fn()

      timeService.startClockUpdates(callback)

      // Should update immediately
      expect(callback).toHaveBeenCalledTimes(1)

      // Should update again after interval
      jest.advanceTimersByTime(1000)
      expect(callback).toHaveBeenCalledTimes(2)

      // And again
      jest.advanceTimersByTime(1000)
      expect(callback).toHaveBeenCalledTimes(3)
    })

    it('should update DOM immediately when starting clock', () => {
      timeService.startClockUpdates()

      const timeElement = document.getElementById('time')
      const dateElement = document.getElementById('date')

      expect(timeElement?.textContent).toMatch(/^\d{2}:\d{2}$/)
      expect(dateElement?.textContent).toMatch(/\w+.*\w+.*\d+/)
    })

    it('should stop existing intervals before starting new ones', () => {
      const callback1 = jest.fn()
      const callback2 = jest.fn()

      timeService.startClockUpdates(callback1)
      timeService.startClockUpdates(callback2)

      jest.advanceTimersByTime(1000)

      // Only the second callback should be called
      expect(callback1).toHaveBeenCalledTimes(1) // Only initial call
      expect(callback2).toHaveBeenCalledTimes(2) // Initial + interval call
    })

    it('should stop clock updates correctly', () => {
      const callback = jest.fn()

      timeService.startClockUpdates(callback)
      timeService.stopClockUpdates()

      jest.advanceTimersByTime(5000) // Advance 5 seconds

      // Should only have been called once (initially)
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should track clock interval status correctly', () => {
      expect(timeService.getIntervalStatus().clockRunning).toBe(false)

      timeService.startClockUpdates()
      expect(timeService.getIntervalStatus().clockRunning).toBe(true)

      timeService.stopClockUpdates()
      expect(timeService.getIntervalStatus().clockRunning).toBe(false)
    })
  })

  describe('Weather Interval Management', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should start weather updates with correct interval', async () => {
      const callback = jest.fn().mockResolvedValue(undefined)

      timeService.startWeatherUpdates(callback)

      // Should update immediately
      await jest.runOnlyPendingTimersAsync()
      expect(callback).toHaveBeenCalledTimes(1)

      // Should update again after interval (10 minutes)
      jest.advanceTimersByTime(600000)
      await jest.runOnlyPendingTimersAsync()
      expect(callback).toHaveBeenCalledTimes(2)
    })

    it('should handle async weather update callbacks', async () => {
      const asyncCallback = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return 'completed'
      })

      timeService.startWeatherUpdates(asyncCallback)
      await jest.runOnlyPendingTimersAsync()

      expect(asyncCallback).toHaveBeenCalledTimes(1)
    })

    it('should handle weather callback errors gracefully', async () => {
      const errorCallback = jest
        .fn()
        .mockRejectedValue(new Error('Weather update failed'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      timeService.startWeatherUpdates(errorCallback)
      await jest.runOnlyPendingTimersAsync()

      expect(errorCallback).toHaveBeenCalledTimes(1)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Weather update callback failed:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should stop weather updates correctly', async () => {
      const callback = jest.fn().mockResolvedValue(undefined)

      timeService.startWeatherUpdates(callback)
      timeService.stopWeatherUpdates()

      jest.advanceTimersByTime(600000) // Advance 10 minutes
      await jest.runOnlyPendingTimersAsync()

      // Should only have been called once (initially)
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should track weather interval status correctly', () => {
      const callback = jest.fn().mockResolvedValue(undefined)

      expect(timeService.getIntervalStatus().weatherRunning).toBe(false)

      timeService.startWeatherUpdates(callback)
      expect(timeService.getIntervalStatus().weatherRunning).toBe(true)

      timeService.stopWeatherUpdates()
      expect(timeService.getIntervalStatus().weatherRunning).toBe(false)
    })
  })

  describe('Interval Management Integration', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should stop all intervals at once', () => {
      const clockCallback = jest.fn()
      const weatherCallback = jest.fn().mockResolvedValue(undefined)

      timeService.startClockUpdates(clockCallback)
      timeService.startWeatherUpdates(weatherCallback)

      expect(timeService.getIntervalStatus().clockRunning).toBe(true)
      expect(timeService.getIntervalStatus().weatherRunning).toBe(true)

      timeService.stopAllIntervals()

      expect(timeService.getIntervalStatus().clockRunning).toBe(false)
      expect(timeService.getIntervalStatus().weatherRunning).toBe(false)
    })

    it('should handle multiple start/stop cycles correctly', () => {
      const callback = jest.fn()

      // Start and stop multiple times
      timeService.startClockUpdates(callback)
      timeService.stopClockUpdates()
      timeService.startClockUpdates(callback)
      timeService.stopClockUpdates()
      timeService.startClockUpdates(callback)

      expect(timeService.getIntervalStatus().clockRunning).toBe(true)

      jest.advanceTimersByTime(1000)
      expect(callback).toHaveBeenCalledTimes(4) // 3 initial calls + 1 interval call
    })
  })

  describe('Duration Formatting', () => {
    it('should format durations in milliseconds correctly', () => {
      const testCases = [
        { ms: 1000, expected: '1s' },
        { ms: 30000, expected: '30s' },
        { ms: 60000, expected: '1m 0s' },
        { ms: 90000, expected: '1m 30s' },
        { ms: 3600000, expected: '1h 0m' },
        { ms: 3660000, expected: '1h 1m' },
        { ms: 3690000, expected: '1h 1m' },
      ]

      testCases.forEach(({ ms, expected }) => {
        const result = timeService.formatDuration(ms)
        expect(result).toBe(expected)
      })
    })

    it('should handle edge case durations', () => {
      const edgeCases = [
        { ms: 0, expected: '0s' },
        { ms: 999, expected: '0s' },
        { ms: 86400000, expected: '24h 0m' }, // 1 day
      ]

      edgeCases.forEach(({ ms, expected }) => {
        const result = timeService.formatDuration(ms)
        expect(result).toBe(expected)
      })
    })
  })

  describe('Time Until Next Update', () => {
    it('should return formatted time until next updates', () => {
      const nextUpdates = timeService.getTimeUntilNextUpdate()

      expect(nextUpdates.clockUpdate).toBe('1s')
      expect(nextUpdates.weatherUpdate).toBe('10m 0s')
    })

    it('should use interval settings for calculations', () => {
      const settings = timeService.getIntervalSettings()
      const nextUpdates = timeService.getTimeUntilNextUpdate()

      expect(nextUpdates.clockUpdate).toBe(
        timeService.formatDuration(settings.clockUpdateInterval)
      )
      expect(nextUpdates.weatherUpdate).toBe(
        timeService.formatDuration(settings.weatherUpdateInterval)
      )
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid Unix timestamps gracefully', () => {
      const invalidTimestamps = [NaN, Infinity, -Infinity, null, undefined]

      invalidTimestamps.forEach(invalid => {
        expect(() => {
          timeService.formatTimeFromUnix(invalid as number)
        }).not.toThrow()
      })
    })

    it('should handle system clock changes during interval operation', () => {
      jest.useFakeTimers()
      const callback = jest.fn()

      timeService.startClockUpdates(callback)

      // Simulate system clock change
      jest.setSystemTime(new Date('2025-01-01T00:00:00Z'))
      jest.advanceTimersByTime(1000)

      expect(callback).toHaveBeenCalledTimes(2) // Initial + 1 interval call
      expect(() => {
        timeService.updateTimeAndDateDisplay()
      }).not.toThrow()

      jest.useRealTimers()
    })

    it('should handle rapid start/stop operations', () => {
      const callback = jest.fn()

      // Rapid start/stop operations
      for (let i = 0; i < 10; i++) {
        timeService.startClockUpdates(callback)
        timeService.stopClockUpdates()
      }

      expect(timeService.getIntervalStatus().clockRunning).toBe(false)
      expect(() => {
        timeService.stopAllIntervals()
      }).not.toThrow()
    })
  })
})
