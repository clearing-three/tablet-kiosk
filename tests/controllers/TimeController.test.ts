/**
 * TimeController Tests
 *
 * Tests for TimeController covering:
 * - Interval management via UpdateScheduler
 * - Error handling and recovery
 * - View coordination
 */

import type { Mock } from 'vitest'
import { TimeController } from '../../src/controllers/TimeController'
import type { TimeView } from '../../src/components/Time/TimeView'
import type { ErrorDisplay } from '../../src/components/ErrorDisplay'

describe('TimeController', () => {
  let timeController: TimeController
  let mockTimeView: Pick<TimeView, 'render'>
  let mockErrorDisplay: Pick<ErrorDisplay, 'show' | 'remove'>

  beforeEach(() => {
    vi.useFakeTimers()
    mockTimeView = {
      render: vi.fn(),
    }
    mockErrorDisplay = {
      show: vi.fn(),
      remove: vi.fn(),
    }
    timeController = new TimeController(
      mockTimeView as TimeView,
      mockErrorDisplay as ErrorDisplay
    )
  })

  afterEach(() => {
    timeController.destroy()
    vi.useRealTimers()
  })

  describe('start()', () => {
    it('should call view render immediately', () => {
      timeController.start()

      expect(mockTimeView.render).toHaveBeenCalledOnce()
    })

    it('should call view render every second', () => {
      timeController.start()
      vi.advanceTimersByTime(1000)

      expect(mockTimeView.render).toHaveBeenCalledTimes(2) // initial + 1s
    })

    it('should continue updating on subsequent ticks', () => {
      timeController.start()
      vi.advanceTimersByTime(3000)

      expect(mockTimeView.render).toHaveBeenCalledTimes(4) // initial + 3 ticks
    })
  })

  describe('stop()', () => {
    it('should stop the update interval', () => {
      timeController.start()
      timeController.stop()
      const callsBefore = (mockTimeView.render as Mock).mock.calls.length

      vi.advanceTimersByTime(3000)

      expect(mockTimeView.render).toHaveBeenCalledTimes(callsBefore)
    })

    it('should be safe to call when not running', () => {
      expect(() => timeController.stop()).not.toThrow()
    })
  })

  describe('destroy()', () => {
    it('should stop the update interval', () => {
      timeController.start()
      timeController.destroy()
      const callsBefore = (mockTimeView.render as Mock).mock.calls.length

      vi.advanceTimersByTime(3000)

      expect(mockTimeView.render).toHaveBeenCalledTimes(callsBefore)
    })
  })

  describe('updateDisplay()', () => {
    it('should trigger view render', () => {
      timeController.updateDisplay()

      expect(mockTimeView.render).toHaveBeenCalledOnce()
    })
  })

  describe('error handling', () => {
    it('should show error when view render throws', () => {
      const err = new Error('render failed')
      ;(mockTimeView.render as Mock).mockImplementation(() => {
        throw err
      })

      timeController.start()

      expect(mockErrorDisplay.show).toHaveBeenCalledWith('clock-update', err)
    })

    it('should show error on each failing tick', () => {
      ;(mockTimeView.render as Mock).mockImplementation(() => {
        throw new Error('fail')
      })

      timeController.start()
      vi.advanceTimersByTime(2000)

      expect(mockErrorDisplay.show).toHaveBeenCalledTimes(3) // initial + 2 ticks
    })

    it('should remove error when render recovers after failure', () => {
      ;(mockTimeView.render as Mock)
        .mockImplementationOnce(() => {
          throw new Error('fail')
        })
        .mockImplementation(() => {}) // subsequent calls succeed

      timeController.start()
      vi.advanceTimersByTime(1000)

      expect(mockErrorDisplay.remove).toHaveBeenCalledWith('clock-update')
    })

    it('should only remove error once after recovery', () => {
      ;(mockTimeView.render as Mock)
        .mockImplementationOnce(() => {
          throw new Error('fail')
        })
        .mockImplementation(() => {})

      timeController.start()
      vi.advanceTimersByTime(3000)

      expect(mockErrorDisplay.remove).toHaveBeenCalledOnce()
    })

    it('should not remove error on successful tick not preceded by failure', () => {
      timeController.start()
      vi.advanceTimersByTime(3000)

      expect(mockErrorDisplay.remove).not.toHaveBeenCalled()
    })
  })
})
