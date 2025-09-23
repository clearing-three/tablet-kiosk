/**
 * TimeDisplay Component Tests
 *
 * Comprehensive tests for TimeDisplay component including:
 * - Clock updates every second
 * - Date formatting accuracy
 * - Interval management
 * - Error handling and DOM manipulation
 */

import { TimeDisplay } from '../../src/components/Time/TimeDisplay'

// Mock DOM elements
const mockElements = {
  time: document.createElement('div'),
  date: document.createElement('div'),
}

// Mock document.getElementById
const mockGetElementById = jest.fn((id: string): HTMLElement | null => {
  const elementMap: Record<string, HTMLElement> = {
    time: mockElements.time,
    date: mockElements.date,
  }
  return elementMap[id] || null
})

// Mock formatters
const mockFormatCurrentTime = jest.fn(() => '14:30')
const mockFormatCurrentDate = jest.fn(() => 'Monday, January 1')

jest.mock('../../src/utils/formatters', () => ({
  formatCurrentTime: () => mockFormatCurrentTime(),
  formatCurrentDate: () => mockFormatCurrentDate(),
}))

// Mock timers
jest.useFakeTimers()

describe('TimeDisplay', () => {
  let timeDisplay: TimeDisplay

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock document.getElementById
    jest
      .spyOn(document, 'getElementById')
      .mockImplementation(mockGetElementById)

    // Clear element content
    Object.values(mockElements).forEach(element => {
      element.textContent = ''
    })

    // Create TimeDisplay instance
    timeDisplay = new TimeDisplay()
  })

  afterEach(() => {
    // Clean up intervals
    timeDisplay.destroy()

    // Clear all timers
    jest.clearAllTimers()

    jest.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize DOM element references', () => {
      expect(document.getElementById).toHaveBeenCalledWith('time')
      expect(document.getElementById).toHaveBeenCalledWith('date')
    })

    it('should handle missing DOM elements gracefully', () => {
      mockGetElementById.mockReturnValue(null)

      expect(() => {
        new TimeDisplay()
      }).not.toThrow()
    })

    it('should check if initialized correctly', () => {
      expect(timeDisplay.isInitialized()).toBe(true)

      // Test with missing elements
      mockGetElementById.mockReturnValue(null)
      const timeDisplayWithMissingElements = new TimeDisplay()
      expect(timeDisplayWithMissingElements.isInitialized()).toBe(false)
    })

    it('should have correct update interval', () => {
      expect(timeDisplay.getUpdateInterval()).toBe(1000) // 1 second
    })
  })

  describe('manual updates', () => {
    it('should update time and date displays manually', () => {
      timeDisplay.updateOnce()

      expect(mockFormatCurrentTime).toHaveBeenCalled()
      expect(mockFormatCurrentDate).toHaveBeenCalled()
      expect(mockElements.time.textContent).toBe('14:30')
      expect(mockElements.date.textContent).toBe('Monday, January 1')
    })

    it('should handle missing DOM elements during manual update', () => {
      mockGetElementById.mockImplementation(
        (id: string): HTMLElement | null => {
          if (id === 'time') return null
          return mockElements[id as keyof typeof mockElements] || null
        }
      )

      timeDisplay.refreshElements()

      expect(() => {
        timeDisplay.updateOnce()
      }).not.toThrow()

      // Date should still be updated
      expect(mockElements.date.textContent).toBe('Monday, January 1')
    })

    it('should handle formatting errors during update', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      mockFormatCurrentTime.mockImplementation(() => {
        throw new Error('Time formatting failed')
      })

      timeDisplay.updateOnce()

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error updating time display:',
        expect.any(Error)
      )
      expect(mockElements.time.textContent).toBe('--:--')

      // Date should still work
      expect(mockElements.date.textContent).toBe('Monday, January 1')

      consoleSpy.mockRestore()
    })

    it('should handle date formatting errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      mockFormatCurrentDate.mockImplementation(() => {
        throw new Error('Date formatting failed')
      })

      timeDisplay.updateOnce()

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error updating date display:',
        expect.any(Error)
      )
      expect(mockElements.date.textContent).toBe('Date unavailable')

      // Time should still work
      expect(mockElements.time.textContent).toBe('14:30')

      consoleSpy.mockRestore()
    })
  })

  describe('automatic updates', () => {
    it('should start updates with initial update', () => {
      expect(timeDisplay.isUpdating()).toBe(false)

      timeDisplay.startUpdates()

      expect(timeDisplay.isUpdating()).toBe(true)

      // Check initial update
      expect(mockFormatCurrentTime).toHaveBeenCalled()
      expect(mockFormatCurrentDate).toHaveBeenCalled()
      expect(mockElements.time.textContent).toBe('14:30')
      expect(mockElements.date.textContent).toBe('Monday, January 1')
    })

    it('should update every second during automatic updates', () => {
      timeDisplay.startUpdates()

      // Initial call count
      expect(mockFormatCurrentTime).toHaveBeenCalledTimes(1)
      expect(mockFormatCurrentDate).toHaveBeenCalledTimes(1)

      // Advance time by 1 second
      jest.advanceTimersByTime(1000)

      expect(mockFormatCurrentTime).toHaveBeenCalledTimes(2)
      expect(mockFormatCurrentDate).toHaveBeenCalledTimes(2)

      // Advance time by 3 more seconds
      jest.advanceTimersByTime(3000)

      expect(mockFormatCurrentTime).toHaveBeenCalledTimes(5)
      expect(mockFormatCurrentDate).toHaveBeenCalledTimes(5)
    })

    it('should stop updates when requested', () => {
      timeDisplay.startUpdates()
      expect(timeDisplay.isUpdating()).toBe(true)

      // Clear mock calls from initial update
      jest.clearAllMocks()

      timeDisplay.stopUpdates()
      expect(timeDisplay.isUpdating()).toBe(false)

      // Advance time - should not trigger updates
      jest.advanceTimersByTime(5000)

      expect(mockFormatCurrentTime).not.toHaveBeenCalled()
      expect(mockFormatCurrentDate).not.toHaveBeenCalled()
    })

    it('should clear existing interval when starting new updates', () => {
      // Start first interval
      timeDisplay.startUpdates()
      const firstUpdateCount = mockFormatCurrentTime.mock.calls.length

      // Start again - should clear previous interval
      timeDisplay.startUpdates()

      // Should have performed initial update again
      expect(mockFormatCurrentTime).toHaveBeenCalledTimes(firstUpdateCount + 1)

      // Advance time - should only have one active interval
      jest.clearAllMocks()
      jest.advanceTimersByTime(1000)

      expect(mockFormatCurrentTime).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple start/stop cycles', () => {
      // Start and stop multiple times
      timeDisplay.startUpdates()
      timeDisplay.stopUpdates()
      timeDisplay.startUpdates()
      timeDisplay.stopUpdates()
      timeDisplay.startUpdates()

      expect(timeDisplay.isUpdating()).toBe(true)

      // Should work normally
      jest.clearAllMocks()
      jest.advanceTimersByTime(1000)

      expect(mockFormatCurrentTime).toHaveBeenCalledTimes(1)
    })
  })

  describe('error state handling', () => {
    it('should show error state when explicitly called', () => {
      timeDisplay.showErrorState()

      expect(mockElements.time.textContent).toBe('--:--')
      expect(mockElements.date.textContent).toBe('Date unavailable')
    })

    it('should handle error state with missing elements', () => {
      mockGetElementById.mockImplementation(
        (id: string): HTMLElement | null => {
          if (id === 'time') return null
          return mockElements[id as keyof typeof mockElements] || null
        }
      )

      timeDisplay.refreshElements()

      expect(() => {
        timeDisplay.showErrorState()
      }).not.toThrow()

      // Available element should show error state
      expect(mockElements.date.textContent).toBe('Date unavailable')
    })

    it('should handle individual formatting failures gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Mock only time formatting to fail
      mockFormatCurrentTime.mockImplementation(() => {
        throw new Error('Time format error')
      })

      timeDisplay.updateOnce()

      // Time should show error, date should be normal
      expect(mockElements.time.textContent).toBe('--:--')
      expect(mockElements.date.textContent).toBe('Monday, January 1')

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error updating time display:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('DOM element management', () => {
    it('should refresh element references when requested', () => {
      const spy = jest.spyOn(document, 'getElementById')
      spy.mockClear()

      timeDisplay.refreshElements()

      expect(spy).toHaveBeenCalledWith('time')
      expect(spy).toHaveBeenCalledWith('date')
    })

    it('should get current display values', () => {
      timeDisplay.updateOnce()

      const displayValues = timeDisplay.getCurrentDisplayValues()

      expect(displayValues.time).toBe('14:30')
      expect(displayValues.date).toBe('Monday, January 1')
    })

    it('should handle getting display values with missing elements', () => {
      mockGetElementById.mockImplementation(
        (id: string): HTMLElement | null => {
          if (id === 'time') return null
          return mockElements[id as keyof typeof mockElements] || null
        }
      )

      timeDisplay.refreshElements()

      const displayValues = timeDisplay.getCurrentDisplayValues()

      expect(displayValues.time).toBeNull()
      expect(displayValues.date).toBe('')
    })

    it('should handle element refreshing when DOM changes', () => {
      // Initial update
      timeDisplay.updateOnce()
      expect(mockElements.time.textContent).toBe('14:30')

      // Simulate DOM change - new element
      const newTimeElement = document.createElement('div')
      mockGetElementById.mockImplementation(
        (id: string): HTMLElement | null => {
          if (id === 'time') return newTimeElement
          return mockElements[id as keyof typeof mockElements] || null
        }
      )

      // Refresh and update again
      timeDisplay.refreshElements()
      timeDisplay.updateOnce()

      // New element should be updated
      expect(newTimeElement.textContent).toBe('14:30')
      // Old element should remain unchanged
      expect(mockElements.time.textContent).toBe('14:30')
    })
  })

  describe('cleanup and lifecycle', () => {
    it('should stop updates when destroyed', () => {
      timeDisplay.startUpdates()
      expect(timeDisplay.isUpdating()).toBe(true)

      timeDisplay.destroy()
      expect(timeDisplay.isUpdating()).toBe(false)
    })

    it('should handle destroy when not updating', () => {
      expect(timeDisplay.isUpdating()).toBe(false)

      expect(() => {
        timeDisplay.destroy()
      }).not.toThrow()

      expect(timeDisplay.isUpdating()).toBe(false)
    })

    it('should handle multiple destroy calls', () => {
      timeDisplay.startUpdates()

      timeDisplay.destroy()
      timeDisplay.destroy()
      timeDisplay.destroy()

      expect(timeDisplay.isUpdating()).toBe(false)
    })
  })

  describe('timing and performance', () => {
    it('should maintain accurate timing over extended periods', () => {
      timeDisplay.startUpdates()

      // Clear initial call
      jest.clearAllMocks()

      // Simulate 10 minutes (600 seconds)
      const minutes = 10
      const expectedCalls = minutes * 60

      jest.advanceTimersByTime(minutes * 60 * 1000)

      expect(mockFormatCurrentTime).toHaveBeenCalledTimes(expectedCalls)
      expect(mockFormatCurrentDate).toHaveBeenCalledTimes(expectedCalls)
    })

    it('should handle rapid start/stop operations', () => {
      // Rapid operations
      for (let i = 0; i < 10; i++) {
        timeDisplay.startUpdates()
        timeDisplay.stopUpdates()
      }

      // Final start
      timeDisplay.startUpdates()

      expect(timeDisplay.isUpdating()).toBe(true)

      // Should work normally
      jest.clearAllMocks()
      jest.advanceTimersByTime(1000)

      expect(mockFormatCurrentTime).toHaveBeenCalledTimes(1)
    })

    it('should not leak intervals', () => {
      const initialIntervalCount = jest.getTimerCount()

      // Start and stop multiple times
      for (let i = 0; i < 5; i++) {
        timeDisplay.startUpdates()
        timeDisplay.stopUpdates()
      }

      const finalIntervalCount = jest.getTimerCount()

      // Should not have accumulated intervals
      expect(finalIntervalCount).toBe(initialIntervalCount)
    })
  })

  describe('edge cases and error conditions', () => {
    it('should handle formatter returning different values over time', () => {
      let timeCounter = 0
      mockFormatCurrentTime.mockImplementation(() => {
        timeCounter++
        return `14:${timeCounter.toString().padStart(2, '0')}`
      })

      timeDisplay.startUpdates()

      // Initial value
      expect(mockElements.time.textContent).toBe('14:01')

      // Advance time
      jest.advanceTimersByTime(2000)

      // Should show updated time
      expect(mockElements.time.textContent).toBe('14:03')
    })

    it('should handle formatters throwing intermittent errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      let callCount = 0
      mockFormatCurrentTime.mockImplementation(() => {
        callCount++
        if (callCount === 2) {
          throw new Error('Intermittent error')
        }
        return '14:30'
      })

      timeDisplay.startUpdates()

      // Should start normally
      expect(mockElements.time.textContent).toBe('14:30')

      // Advance to trigger error
      jest.advanceTimersByTime(1000)
      expect(mockElements.time.textContent).toBe('--:--')

      // Advance to recover
      jest.advanceTimersByTime(1000)
      expect(mockElements.time.textContent).toBe('14:30')

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error updating time display:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should handle null/undefined return values from formatters', () => {
      mockFormatCurrentTime.mockReturnValue(null as any)
      mockFormatCurrentDate.mockReturnValue(undefined as any)

      timeDisplay.updateOnce()

      // Should handle gracefully
      expect(mockElements.time.textContent).toBe('')
      expect(mockElements.date.textContent).toBe('')
    })

    it('should handle very long strings from formatters', () => {
      const longTimeString = 'A'.repeat(1000)
      const longDateString = 'B'.repeat(1000)

      mockFormatCurrentTime.mockReturnValue(longTimeString)
      mockFormatCurrentDate.mockReturnValue(longDateString)

      timeDisplay.updateOnce()

      expect(mockElements.time.textContent).toBe(longTimeString)
      expect(mockElements.date.textContent).toBe(longDateString)
    })
  })
})
