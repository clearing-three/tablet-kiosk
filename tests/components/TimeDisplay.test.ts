/**
 * TimeDisplay Component Tests (3.5.5)
 *
 * Tests for TimeDisplay component covering:
 * - Clock updates every second
 * - Date formatting accuracy
 * - Interval management
 */

import { TimeDisplay } from '../../src/components/Time/TimeDisplay'
import * as formatters from '../../src/utils/formatters'

describe('TimeDisplay', () => {
  let timeDisplay: TimeDisplay

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="time"></div>
      <div id="date"></div>
    `
    jest.useFakeTimers()
    jest.spyOn(formatters, 'formatCurrentTime').mockReturnValue('14:30')
    jest
      .spyOn(formatters, 'formatCurrentDate')
      .mockReturnValue('Friday, February 20')
    timeDisplay = new TimeDisplay()
  })

  afterEach(() => {
    timeDisplay.destroy()
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should throw when required DOM elements are missing', () => {
      document.body.innerHTML = ''

      expect(() => new TimeDisplay()).toThrow('Required DOM element not found')
    })

    it('should throw indicating which element is missing', () => {
      document.body.innerHTML = '<div id="time"></div>'

      expect(() => new TimeDisplay()).toThrow('#date')
    })
  })

  describe('date formatting accuracy', () => {
    it('should display the formatted time after updateDisplay', () => {
      timeDisplay.updateDisplay()

      expect(document.getElementById('time')!.textContent).toBe('14:30')
    })

    it('should display the formatted date after updateDisplay', () => {
      timeDisplay.updateDisplay()

      expect(document.getElementById('date')!.textContent).toBe(
        'Friday, February 20'
      )
    })

    it('should call formatCurrentTime to get the time value', () => {
      timeDisplay.updateDisplay()

      expect(formatters.formatCurrentTime).toHaveBeenCalled()
    })

    it('should call formatCurrentDate to get the date value', () => {
      timeDisplay.updateDisplay()

      expect(formatters.formatCurrentDate).toHaveBeenCalled()
    })

    it('should reflect updated formatter output on each call', () => {
      ;(formatters.formatCurrentTime as jest.Mock).mockReturnValue('09:05')
      ;(formatters.formatCurrentDate as jest.Mock).mockReturnValue(
        'Monday, March 2'
      )

      timeDisplay.updateDisplay()

      expect(document.getElementById('time')!.textContent).toBe('09:05')
      expect(document.getElementById('date')!.textContent).toBe(
        'Monday, March 2'
      )
    })
  })

  describe('clock updates every second', () => {
    it('should perform an immediate update when startUpdates is called', () => {
      timeDisplay.startUpdates()

      expect(document.getElementById('time')!.textContent).toBe('14:30')
      expect(document.getElementById('date')!.textContent).toBe(
        'Friday, February 20'
      )
    })

    it('should update the display after one second', () => {
      ;(formatters.formatCurrentTime as jest.Mock).mockReturnValue('14:31')
      timeDisplay.startUpdates()

      jest.advanceTimersByTime(1000)

      expect(document.getElementById('time')!.textContent).toBe('14:31')
    })

    it('should update the display on each subsequent tick', () => {
      timeDisplay.startUpdates()
      ;(formatters.formatCurrentTime as jest.Mock).mockReturnValue('14:31')
      jest.advanceTimersByTime(1000)
      ;(formatters.formatCurrentTime as jest.Mock).mockReturnValue('14:32')
      jest.advanceTimersByTime(1000)

      expect(document.getElementById('time')!.textContent).toBe('14:32')
    })

    it('should use a 1000ms interval', () => {
      expect(timeDisplay.getUpdateInterval()).toBe(1000)
    })
  })

  describe('interval management', () => {
    it('should report isUpdating as false before startUpdates', () => {
      expect(timeDisplay.isUpdating()).toBe(false)
    })

    it('should report isUpdating as true after startUpdates', () => {
      timeDisplay.startUpdates()

      expect(timeDisplay.isUpdating()).toBe(true)
    })

    it('should report isUpdating as false after stopUpdates', () => {
      timeDisplay.startUpdates()
      timeDisplay.stopUpdates()

      expect(timeDisplay.isUpdating()).toBe(false)
    })

    it('should stop ticking after stopUpdates', () => {
      timeDisplay.startUpdates()
      timeDisplay.stopUpdates()

      const callsBefore = (formatters.formatCurrentTime as jest.Mock).mock.calls
        .length

      jest.advanceTimersByTime(3000)

      expect(formatters.formatCurrentTime).toHaveBeenCalledTimes(callsBefore)
    })

    it('should clear the existing interval when startUpdates is called again', () => {
      timeDisplay.startUpdates()
      timeDisplay.startUpdates()

      expect(jest.getTimerCount()).toBe(1)
    })

    it('should be safe to call stopUpdates when not running', () => {
      expect(() => timeDisplay.stopUpdates()).not.toThrow()
    })

    it('should stop updates when destroy is called', () => {
      timeDisplay.startUpdates()
      timeDisplay.destroy()

      expect(timeDisplay.isUpdating()).toBe(false)
    })

    it('should stop ticking after destroy', () => {
      timeDisplay.startUpdates()
      timeDisplay.destroy()

      const callsBefore = (formatters.formatCurrentTime as jest.Mock).mock.calls
        .length

      jest.advanceTimersByTime(3000)

      expect(formatters.formatCurrentTime).toHaveBeenCalledTimes(callsBefore)
    })
  })

  describe('getCurrentDisplayValues', () => {
    it('should return empty strings before any update', () => {
      const values = timeDisplay.getCurrentDisplayValues()

      expect(values.time).toBe('')
      expect(values.date).toBe('')
    })

    it('should return the current displayed time and date after an update', () => {
      timeDisplay.updateDisplay()

      const values = timeDisplay.getCurrentDisplayValues()

      expect(values.time).toBe('14:30')
      expect(values.date).toBe('Friday, February 20')
    })
  })
})
