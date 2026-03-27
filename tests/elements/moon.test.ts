import type { NasaMoonImage } from '../../src/types/nasa-api.types'

const mockGetCurrentMoonImage = vi.fn()

vi.mock('../../src/services/NasaMoonService', () => ({
  NasaMoonService: vi.fn().mockImplementation(function (this: any) {
    this.getCurrentMoonImage = mockGetCurrentMoonImage
    this.fetchMoonImage = vi.fn()
    this.formatTimestamp = vi.fn()
  }),
}))

import { Moon, SIXTY_MINUTES_MILLIS } from '../../src/elements/moon'

describe('Moon', () => {
  let element: Moon

  const mockMoonImage: NasaMoonImage = {
    url: 'https://example.org/moon.jpg',
    width: 730,
    height: 730,
    alt_text: 'Waxing Gibbous Moon',
  }

  const getMoonImage = (el: Moon): HTMLImageElement | null => {
    return el.shadowRoot?.querySelector('.moon') ?? null
  }

  const getMoonImageSrc = (el: Moon): string => {
    const img = getMoonImage(el)
    return img?.getAttribute('src') ?? ''
  }

  const waitForMoonUpdate = async (el: Moon) => {
    await el.updateComplete // initial update after connectedCallback
    // Wait for async updateMoon to complete (flush microtask queue)
    await Promise.resolve()
    await el.updateComplete // update after state change from updateMoon
  }

  beforeEach(() => {
    vi.useFakeTimers()
    mockGetCurrentMoonImage.mockClear()
    mockGetCurrentMoonImage.mockResolvedValue(mockMoonImage)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should not fetch moon data before being connected', () => {
      // given
      element = document.createElement('x-moon') as Moon

      // expect
      expect(mockGetCurrentMoonImage).not.toHaveBeenCalled()
    })
  })

  describe('connectedCallback', () => {
    it('should update moon immediately on connection', async () => {
      // given
      element = document.createElement('x-moon') as Moon

      // when
      document.body.appendChild(element)
      await waitForMoonUpdate(element)

      // then
      expect(mockGetCurrentMoonImage).toHaveBeenCalledOnce()
      element.remove()
    })

    it('should start interval timer on connection', async () => {
      // given
      element = document.createElement('x-moon') as Moon
      document.body.appendChild(element)
      await element.updateComplete

      // then
      expect(mockGetCurrentMoonImage).toHaveBeenCalledOnce()

      // when
      await vi.advanceTimersByTimeAsync(SIXTY_MINUTES_MILLIS)

      // then
      expect(mockGetCurrentMoonImage).toHaveBeenCalledTimes(2)
      element.remove()
    })

    it('should continue updating every hour', async () => {
      // given
      element = document.createElement('x-moon') as Moon
      document.body.appendChild(element)
      await element.updateComplete

      // when
      await vi.advanceTimersByTimeAsync(SIXTY_MINUTES_MILLIS * 3)

      // then
      expect(mockGetCurrentMoonImage).toHaveBeenCalledTimes(4)
      element.remove()
    })

    it('should update moon image URL on each interval', async () => {
      // given
      const firstMoonImage = {
        ...mockMoonImage,
        url: 'https://example.com/moon1.jpg',
      }
      const secondMoonImage = {
        ...mockMoonImage,
        url: 'https://example.com/moon2.jpg',
      }

      mockGetCurrentMoonImage
        .mockResolvedValueOnce(firstMoonImage)
        .mockResolvedValueOnce(secondMoonImage)

      element = document.createElement('x-moon') as Moon
      document.body.appendChild(element)
      await waitForMoonUpdate(element)

      // then
      expect(getMoonImageSrc(element)).toBe(firstMoonImage.url)

      // when
      await vi.advanceTimersByTimeAsync(SIXTY_MINUTES_MILLIS)
      await waitForMoonUpdate(element)

      // then
      expect(getMoonImageSrc(element)).toBe(secondMoonImage.url)
      element.remove()
    })
  })

  describe('disconnectedCallback', () => {
    it('should clear interval timer on disconnection', async () => {
      // given
      element = document.createElement('x-moon') as Moon
      document.body.appendChild(element)
      await element.updateComplete

      const callsBefore = mockGetCurrentMoonImage.mock.calls.length

      // when
      element.remove()
      await vi.advanceTimersByTimeAsync(SIXTY_MINUTES_MILLIS * 5)

      // then
      expect(mockGetCurrentMoonImage).toHaveBeenCalledTimes(callsBefore)
    })

    it('should not throw when disconnected before connected', () => {
      // given
      element = document.createElement('x-moon') as Moon

      // expect
      expect(() => element.disconnectedCallback()).not.toThrow()
    })

    it('should handle multiple disconnections safely', () => {
      // given
      element = document.createElement('x-moon') as Moon
      document.body.appendChild(element)

      // when
      element.remove()

      // expect
      expect(() => element.disconnectedCallback()).not.toThrow()
    })
  })

  describe('rendering', () => {
    it('should render moon image with correct URL', async () => {
      // given
      element = document.createElement('x-moon') as Moon

      // when
      document.body.appendChild(element)
      await waitForMoonUpdate(element)

      // then
      const moonImg = getMoonImage(element)
      expect(moonImg).toBeTruthy()
      expect(getMoonImageSrc(element)).toBe(mockMoonImage.url)
      element.remove()
    })

    it('should render moon image with correct alt text', async () => {
      // given
      element = document.createElement('x-moon') as Moon

      // when
      document.body.appendChild(element)
      await waitForMoonUpdate(element)

      // then
      const moonImg = getMoonImage(element)
      expect(moonImg?.alt).toBe(mockMoonImage.alt_text)
      element.remove()
    })

    it('should render moon image with correct CSS class', async () => {
      // given
      element = document.createElement('x-moon') as Moon

      // when
      document.body.appendChild(element)
      await element.updateComplete

      // then
      const moonImg = getMoonImage(element)
      expect(moonImg?.classList.contains('moon')).toBe(true)
      element.remove()
    })

    it('should render container with correct CSS class', async () => {
      // given
      element = document.createElement('x-moon') as Moon

      // when
      document.body.appendChild(element)
      await element.updateComplete

      // then
      const container = element.shadowRoot?.querySelector('.moon-phase-render')
      expect(container).toBeTruthy()
      element.remove()
    })

    it('should update rendering when moon data changes', async () => {
      // given
      const firstMoon: NasaMoonImage = {
        url: 'https://example.com/new-moon.jpg',
        width: 730,
        height: 730,
        alt_text: 'New Moon',
      }

      const secondMoon: NasaMoonImage = {
        url: 'https://example.com/full-moon.jpg',
        width: 730,
        height: 730,
        alt_text: 'Full Moon',
      }

      mockGetCurrentMoonImage
        .mockResolvedValueOnce(firstMoon)
        .mockResolvedValueOnce(secondMoon)

      element = document.createElement('x-moon') as Moon
      document.body.appendChild(element)
      await waitForMoonUpdate(element)

      // then
      let moonImg = getMoonImage(element)
      expect(getMoonImageSrc(element)).toBe(firstMoon.url)
      expect(moonImg?.alt).toBe(firstMoon.alt_text)

      // when
      await vi.advanceTimersByTimeAsync(SIXTY_MINUTES_MILLIS)
      await waitForMoonUpdate(element)

      // then
      moonImg = getMoonImage(element)
      expect(getMoonImageSrc(element)).toBe(secondMoon.url)
      expect(moonImg?.alt).toBe(secondMoon.alt_text)
      element.remove()
    })
  })

  describe('reconnection', () => {
    it('should restart timer when reconnected', async () => {
      // given
      element = document.createElement('x-moon') as Moon
      document.body.appendChild(element)
      await waitForMoonUpdate(element)

      const callsAfterConnect = mockGetCurrentMoonImage.mock.calls.length

      // when
      element.remove()
      await vi.advanceTimersByTimeAsync(SIXTY_MINUTES_MILLIS * 5)

      // then
      expect(mockGetCurrentMoonImage).toHaveBeenCalledTimes(callsAfterConnect)

      // when
      document.body.appendChild(element)
      await waitForMoonUpdate(element)
      await vi.advanceTimersByTimeAsync(SIXTY_MINUTES_MILLIS * 2)

      // then
      expect(mockGetCurrentMoonImage).toHaveBeenCalledTimes(
        callsAfterConnect + 3
      )
      element.remove()
    })
  })

  describe('interval timing', () => {
    it('should use specified interval', async () => {
      // given
      element = document.createElement('x-moon') as Moon
      document.body.appendChild(element)
      await waitForMoonUpdate(element)

      // then
      expect(mockGetCurrentMoonImage).toHaveBeenCalledOnce()

      // when
      await vi.advanceTimersByTimeAsync(SIXTY_MINUTES_MILLIS - 1)

      // then
      expect(mockGetCurrentMoonImage).toHaveBeenCalledOnce()

      // when
      await vi.advanceTimersByTimeAsync(1)

      // then
      expect(mockGetCurrentMoonImage).toHaveBeenCalledTimes(2)
      element.remove()
    })
  })
})
