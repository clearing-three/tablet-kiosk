import type { Mock } from 'vitest'
import { Time } from '../../src/elements/time-display'
import * as formatters from '../../src/utils/formatters'

describe('Time', () => {
  let element: Time
  let mockFormatCurrentTime: Mock

  const getRenderedText = (el: Time): string => {
    return el.shadowRoot?.textContent?.trim() ?? ''
  }

  beforeEach(() => {
    vi.useFakeTimers()
    mockFormatCurrentTime = vi.fn()
    vi.spyOn(formatters, 'formatCurrentTime').mockImplementation(
      mockFormatCurrentTime
    )
    element = document.createElement('time-display') as Time
  })

  afterEach(() => {
    if (element.isConnected) {
      element.remove()
    }
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('time-display')).toBeDefined()
    })

    it('should create an instance', () => {
      expect(element).toBeInstanceOf(Time)
    })

    it('should not fetch time before being connected', () => {
      expect(mockFormatCurrentTime).not.toHaveBeenCalled()
    })
  })

  describe('connectedCallback', () => {
    it('should update time immediately on connection', () => {
      mockFormatCurrentTime.mockReturnValue('14:30')
      document.body.appendChild(element)

      expect(mockFormatCurrentTime).toHaveBeenCalledOnce()
    })

    it('should start interval timer on connection', async () => {
      mockFormatCurrentTime.mockReturnValue('14:30')
      document.body.appendChild(element)

      // Initial call
      expect(mockFormatCurrentTime).toHaveBeenCalledOnce()

      // Advance time by 1 second
      await vi.advanceTimersByTimeAsync(1000)

      expect(mockFormatCurrentTime).toHaveBeenCalledTimes(2)
    })

    it('should continue updating every second', async () => {
      mockFormatCurrentTime.mockReturnValue('14:30')
      document.body.appendChild(element)

      // Advance time by 5 seconds
      await vi.advanceTimersByTimeAsync(5000)

      expect(mockFormatCurrentTime).toHaveBeenCalledTimes(6) // initial + 5 intervals
    })

    it('should update displayed time on each interval', async () => {
      mockFormatCurrentTime
        .mockReturnValueOnce('14:30')
        .mockReturnValueOnce('14:31')
        .mockReturnValueOnce('14:32')

      document.body.appendChild(element)
      await element.updateComplete

      expect(getRenderedText(element)).toBe('14:30')

      await vi.advanceTimersByTimeAsync(1000)
      await element.updateComplete
      expect(getRenderedText(element)).toBe('14:31')

      await vi.advanceTimersByTimeAsync(1000)
      await element.updateComplete
      expect(getRenderedText(element)).toBe('14:32')
    })
  })

  describe('disconnectedCallback', () => {
    it('should clear interval timer on disconnection', async () => {
      mockFormatCurrentTime.mockReturnValue('14:30')
      document.body.appendChild(element)

      const callsBefore = mockFormatCurrentTime.mock.calls.length

      element.remove()

      // Advance time by several seconds
      await vi.advanceTimersByTimeAsync(5000)

      // Should not have called again after disconnect
      expect(mockFormatCurrentTime).toHaveBeenCalledTimes(callsBefore)
    })

    it('should not throw when disconnected before connected', () => {
      expect(() => element.disconnectedCallback()).not.toThrow()
    })

    it('should handle multiple disconnections safely', () => {
      document.body.appendChild(element)
      element.remove()

      expect(() => element.disconnectedCallback()).not.toThrow()
    })
  })

  describe('rendering', () => {
    it('should render the current time', async () => {
      mockFormatCurrentTime.mockReturnValue('09:45')
      document.body.appendChild(element)
      await element.updateComplete

      expect(getRenderedText(element)).toBe('09:45')
    })

    it('should update rendering when time changes', async () => {
      mockFormatCurrentTime.mockReturnValue('12:00')
      document.body.appendChild(element)
      await element.updateComplete

      expect(getRenderedText(element)).toBe('12:00')

      mockFormatCurrentTime.mockReturnValue('12:01')
      await vi.advanceTimersByTimeAsync(1000)
      await element.updateComplete

      expect(getRenderedText(element)).toBe('12:01')
    })
  })

  describe('styles', () => {
    it('should have defined static styles', () => {
      expect(Time.styles).toBeDefined()
    })
  })

  describe('reconnection', () => {
    it('should restart timer when reconnected', async () => {
      mockFormatCurrentTime.mockReturnValue('10:00')
      document.body.appendChild(element)
      const callsAfterConnect = mockFormatCurrentTime.mock.calls.length

      element.remove()
      await vi.advanceTimersByTimeAsync(5000)

      // Should not have updated while disconnected
      expect(mockFormatCurrentTime).toHaveBeenCalledTimes(callsAfterConnect)

      // Reconnect
      document.body.appendChild(element)
      await vi.advanceTimersByTimeAsync(2000)

      // Should have updated again after reconnection
      expect(mockFormatCurrentTime).toHaveBeenCalledTimes(callsAfterConnect + 3) // reconnect + 2 intervals
    })
  })

  describe('time formatting', () => {
    it('should handle different time formats', async () => {
      const times = ['00:00', '12:00', '23:59', '08:30']

      for (const time of times) {
        mockFormatCurrentTime.mockReturnValue(time)
        const testElement = document.createElement('time-display') as Time
        document.body.appendChild(testElement)
        await testElement.updateComplete

        expect(getRenderedText(testElement)).toBe(time)

        testElement.remove()
      }
    })
  })
})
