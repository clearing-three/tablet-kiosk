/**
 * TimeDisplay Component Tests (3.5.5)
 *
 * Tests for TimeDisplay component covering:
 * - Clock updates every second
 * - Date formatting accuracy
 * - Interval management
 */

import type { Mock } from 'vitest'
import { TimeDisplay } from '../../src/components/Time/TimeDisplay'
import * as formatters from '../../src/utils/formatters'

describe('TimeDisplay', () => {
  let timeDisplay: TimeDisplay

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="time"></div>
      <div id="date"></div>
    `
    vi.useFakeTimers()
    vi.spyOn(formatters, 'formatCurrentTime').mockReturnValue('14:30')
    vi.spyOn(formatters, 'formatCurrentDate').mockReturnValue(
      'Friday, February 20'
    )
    timeDisplay = new TimeDisplay()
  })

  afterEach(() => {
    timeDisplay.destroy()
    vi.useRealTimers()
    vi.restoreAllMocks()
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
      ;(formatters.formatCurrentTime as Mock).mockReturnValue('09:05')
      ;(formatters.formatCurrentDate as Mock).mockReturnValue('Monday, March 2')

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
      ;(formatters.formatCurrentTime as Mock).mockReturnValue('14:31')
      timeDisplay.startUpdates()

      vi.advanceTimersByTime(1000)

      expect(document.getElementById('time')!.textContent).toBe('14:31')
    })

    it('should update the display on each subsequent tick', () => {
      timeDisplay.startUpdates()
      ;(formatters.formatCurrentTime as Mock).mockReturnValue('14:31')
      vi.advanceTimersByTime(1000)
      ;(formatters.formatCurrentTime as Mock).mockReturnValue('14:32')
      vi.advanceTimersByTime(1000)

      expect(document.getElementById('time')!.textContent).toBe('14:32')
    })
  })

  describe('interval management', () => {
    it('should not have active timers before startUpdates', () => {
      expect(vi.getTimerCount()).toBe(0)
    })

    it('should have active timer after startUpdates', () => {
      timeDisplay.startUpdates()

      expect(vi.getTimerCount()).toBe(1)
    })

    it('should clear timer after stopUpdates', () => {
      timeDisplay.startUpdates()
      timeDisplay.stopUpdates()

      expect(vi.getTimerCount()).toBe(0)
    })

    it('should stop ticking after stopUpdates', () => {
      timeDisplay.startUpdates()
      timeDisplay.stopUpdates()

      const callsBefore = (formatters.formatCurrentTime as Mock).mock.calls
        .length

      vi.advanceTimersByTime(3000)

      expect(formatters.formatCurrentTime).toHaveBeenCalledTimes(callsBefore)
    })

    it('should clear the existing interval when startUpdates is called again', () => {
      timeDisplay.startUpdates()
      timeDisplay.startUpdates()

      expect(vi.getTimerCount()).toBe(1)
    })

    it('should be safe to call stopUpdates when not running', () => {
      expect(() => timeDisplay.stopUpdates()).not.toThrow()
    })

    it('should stop updates when destroy is called', () => {
      timeDisplay.startUpdates()
      timeDisplay.destroy()

      expect(vi.getTimerCount()).toBe(0)
    })

    it('should stop ticking after destroy', () => {
      timeDisplay.startUpdates()
      timeDisplay.destroy()

      const callsBefore = (formatters.formatCurrentTime as Mock).mock.calls
        .length

      vi.advanceTimersByTime(3000)

      expect(formatters.formatCurrentTime).toHaveBeenCalledTimes(callsBefore)
    })
  })

  describe('startUpdates() callbacks', () => {
    it('calls onError with the thrown error when updateDisplay throws on a tick', () => {
      const onError = vi.fn()
      const err = new Error('display failed')
      vi.spyOn(timeDisplay, 'updateDisplay')
        .mockImplementationOnce(() => {}) // initial call succeeds
        .mockImplementation(() => {
          throw err
        })

      timeDisplay.startUpdates(onError)
      vi.advanceTimersByTime(1000)

      expect(onError).toHaveBeenCalledWith(err)
    })

    it('calls onError on every failing tick, not just the first', () => {
      const onError = vi.fn()
      vi.spyOn(timeDisplay, 'updateDisplay')
        .mockImplementationOnce(() => {})
        .mockImplementation(() => {
          throw new Error('fail')
        })

      timeDisplay.startUpdates(onError)
      vi.advanceTimersByTime(3000)

      expect(onError).toHaveBeenCalledTimes(3)
    })

    it('calls onSuccess on the tick after a failure when updateDisplay recovers', () => {
      const onError = vi.fn()
      const onSuccess = vi.fn()
      vi.spyOn(timeDisplay, 'updateDisplay')
        .mockImplementationOnce(() => {}) // initial
        .mockImplementationOnce(() => {
          throw new Error('fail')
        }) // tick 1
        .mockImplementation(() => {}) // tick 2+ succeeds

      timeDisplay.startUpdates(onError, onSuccess)
      vi.advanceTimersByTime(1000) // tick 1: fails
      vi.advanceTimersByTime(1000) // tick 2: recovers

      expect(onSuccess).toHaveBeenCalledOnce()
    })

    it('does not call onSuccess on a successful tick not preceded by a failure', () => {
      const onSuccess = vi.fn()

      timeDisplay.startUpdates(undefined, onSuccess)
      vi.advanceTimersByTime(3000)

      expect(onSuccess).not.toHaveBeenCalled()
    })

    it('does not throw when no callbacks are provided and updateDisplay throws', () => {
      vi.spyOn(timeDisplay, 'updateDisplay')
        .mockImplementationOnce(() => {})
        .mockImplementation(() => {
          throw new Error('fail')
        })

      timeDisplay.startUpdates()

      expect(() => vi.advanceTimersByTime(1000)).not.toThrow()
    })
  })
})
