import type { Mock } from 'vitest'
import { Clock } from '../../src/elements/clock'
import * as formatters from '../../src/utils/formatters'

void Clock // Force module evaluation to ensure @customElement decorator runs

describe('Clock', () => {
  let element: Clock
  let mockFormatCurrentTime: Mock
  let mockFormatCurrentDate: Mock

  const getTimeText = (el: Clock): string => {
    return el.shadowRoot?.querySelector('.time')?.textContent?.trim() ?? ''
  }

  const getDateText = (el: Clock): string => {
    return el.shadowRoot?.querySelector('.date')?.textContent?.trim() ?? ''
  }

  beforeEach(() => {
    vi.useFakeTimers()
    mockFormatCurrentTime = vi.fn()
    mockFormatCurrentDate = vi.fn()
    vi.spyOn(formatters, 'formatCurrentTime').mockImplementation(
      mockFormatCurrentTime
    )
    vi.spyOn(formatters, 'formatCurrentDate').mockImplementation(
      mockFormatCurrentDate
    )
    element = document.createElement('x-clock') as Clock
  })

  afterEach(() => {
    if (element.isConnected) {
      element.remove()
    }
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should not fetch time or date before being connected', () => {
      expect(mockFormatCurrentTime).not.toHaveBeenCalled()
      expect(mockFormatCurrentDate).not.toHaveBeenCalled()
    })
  })

  describe('connectedCallback', () => {
    it('should render time and date immediately on connection', async () => {
      // given
      mockFormatCurrentTime.mockReturnValue('14:30')
      mockFormatCurrentDate.mockReturnValue('Monday, March 26')

      // when
      document.body.appendChild(element)
      await element.updateComplete

      // then
      expect(getTimeText(element)).toBe('14:30')
      expect(getDateText(element)).toBe('Monday, March 26')
    })

    it('should update displayed time and date every second', async () => {
      // given
      mockFormatCurrentTime
        .mockReturnValueOnce('14:30')
        .mockReturnValueOnce('14:31')
        .mockReturnValueOnce('14:32')
      mockFormatCurrentDate
        .mockReturnValueOnce('Monday, March 26')
        .mockReturnValueOnce('Monday, March 26')
        .mockReturnValueOnce('Tuesday, March 27')
      document.body.appendChild(element)
      await element.updateComplete

      expect(getTimeText(element)).toBe('14:30')
      expect(getDateText(element)).toBe('Monday, March 26')

      // when
      await vi.advanceTimersByTimeAsync(1000)
      await element.updateComplete

      // then
      expect(getTimeText(element)).toBe('14:31')
      expect(getDateText(element)).toBe('Monday, March 26')

      // when
      await vi.advanceTimersByTimeAsync(1000)
      await element.updateComplete

      // then
      expect(getTimeText(element)).toBe('14:32')
      expect(getDateText(element)).toBe('Tuesday, March 27')
    })
  })

  describe('disconnectedCallback', () => {
    it('should stop updating when disconnected', async () => {
      // given
      mockFormatCurrentTime
        .mockReturnValueOnce('14:30')
        .mockReturnValueOnce('14:31')
      mockFormatCurrentDate.mockReturnValue('Monday, March 26')
      document.body.appendChild(element)
      await element.updateComplete

      expect(getTimeText(element)).toBe('14:30')

      // when
      element.remove()
      await vi.advanceTimersByTimeAsync(1000)

      // then
      expect(getTimeText(element)).toBe('14:30')
    })

    it('should handle disconnection safely', () => {
      expect(() => element.disconnectedCallback()).not.toThrow()

      document.body.appendChild(element)
      element.remove()

      expect(() => element.disconnectedCallback()).not.toThrow()
    })
  })

  describe('reconnection', () => {
    it('should restart timer when reconnected', async () => {
      // given
      mockFormatCurrentTime
        .mockReturnValueOnce('10:00')
        .mockReturnValueOnce('10:01')
        .mockReturnValueOnce('10:02')
      mockFormatCurrentDate.mockReturnValue('Monday, March 26')
      document.body.appendChild(element)
      await element.updateComplete

      expect(getTimeText(element)).toBe('10:00')

      // when
      element.remove()
      await vi.advanceTimersByTimeAsync(1000)

      // then
      expect(getTimeText(element)).toBe('10:00')

      // when
      document.body.appendChild(element)
      await element.updateComplete

      // then
      expect(getTimeText(element)).toBe('10:01')

      // when
      await vi.advanceTimersByTimeAsync(1000)
      await element.updateComplete

      // then
      expect(getTimeText(element)).toBe('10:02')
    })
  })
})
