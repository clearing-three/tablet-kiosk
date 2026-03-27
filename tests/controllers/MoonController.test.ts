/**
 * MoonController Tests
 *
 * Tests for MoonController covering:
 * - Interval management via UpdateScheduler (hourly updates)
 * - Error handling and recovery
 * - View coordination
 * - NasaMoonService integration
 */

import type { Mock } from 'vitest'
import type { MoonView } from '../../src/components/Astronomy/MoonView'
import type { ErrorDisplay } from '../../src/components/ErrorDisplay'
import type { NasaMoonService } from '../../src/services/NasaMoonService'
import { MoonController } from '../../src/controllers/MoonController'

describe('moonController', () => {
  let moonController: MoonController
  let mockMoonView: Pick<MoonView, 'render'>
  let mockNasaMoonService: Pick<NasaMoonService, 'getCurrentMoonImage'>
  let mockErrorDisplay: Pick<ErrorDisplay, 'show' | 'remove'>

  beforeEach(() => {
    vi.useFakeTimers()
    mockMoonView = {
      render: vi.fn(),
    }
    mockNasaMoonService = {
      getCurrentMoonImage: vi.fn().mockResolvedValue({
        url: 'https://svs.gsfc.nasa.gov/moon.jpg',
        width: 730,
        height: 730,
        alt_text: 'Current moon phase',
      }),
    }
    mockErrorDisplay = {
      show: vi.fn(),
      remove: vi.fn(),
    }
    moonController = new MoonController(
      mockMoonView as MoonView,
      mockNasaMoonService as NasaMoonService,
      mockErrorDisplay as ErrorDisplay,
    )
  })

  afterEach(() => {
    moonController.destroy()
    vi.useRealTimers()
  })

  describe('start()', () => {
    it('should fetch moon data and render immediately', async () => {
      moonController.start()
      await vi.waitFor(() => {
        expect(mockNasaMoonService.getCurrentMoonImage).toHaveBeenCalledOnce()
        expect(mockMoonView.render).toHaveBeenCalledWith(
          'https://svs.gsfc.nasa.gov/moon.jpg',
        )
      })
    })

    it('should fetch and render every hour', async () => {
      moonController.start()
      await vi.waitFor(() => {
        expect(mockMoonView.render).toHaveBeenCalledOnce()
      })
      ;(mockNasaMoonService.getCurrentMoonImage as Mock).mockResolvedValue({
        url: 'https://svs.gsfc.nasa.gov/moon2.jpg',
        width: 730,
        height: 730,
        alt_text: 'Updated moon',
      })

      await vi.advanceTimersByTimeAsync(3600000) // 1 hour

      expect(mockMoonView.render).toHaveBeenCalledWith(
        'https://svs.gsfc.nasa.gov/moon2.jpg',
      )
    })

    it('should continue updating on subsequent hourly ticks', async () => {
      moonController.start()
      await vi.waitFor(() => {
        expect(mockMoonView.render).toHaveBeenCalledOnce()
      })

      await vi.advanceTimersByTimeAsync(7200000) // 2 hours

      expect(mockNasaMoonService.getCurrentMoonImage).toHaveBeenCalledTimes(3) // initial + 2 ticks
    })
  })

  describe('stop()', () => {
    it('should stop the update interval', async () => {
      moonController.start()
      await vi.waitFor(() => {
        expect(mockMoonView.render).toHaveBeenCalled()
      })

      moonController.stop()
      const callsBefore = (mockNasaMoonService.getCurrentMoonImage as Mock).mock.calls.length

      await vi.advanceTimersByTimeAsync(7200000)

      expect(mockNasaMoonService.getCurrentMoonImage).toHaveBeenCalledTimes(
        callsBefore,
      )
    })

    it('should be safe to call when not running', () => {
      expect(() => moonController.stop()).not.toThrow()
    })
  })

  describe('destroy()', () => {
    it('should stop the update interval', async () => {
      moonController.start()
      await vi.waitFor(() => {
        expect(mockMoonView.render).toHaveBeenCalled()
      })

      moonController.destroy()
      const callsBefore = (mockNasaMoonService.getCurrentMoonImage as Mock).mock.calls.length

      await vi.advanceTimersByTimeAsync(7200000)

      expect(mockNasaMoonService.getCurrentMoonImage).toHaveBeenCalledTimes(
        callsBefore,
      )
    })
  })

  describe('error handling', () => {
    it('should show error when service fetch fails', async () => {
      const err = new Error('API error')
      ;(mockNasaMoonService.getCurrentMoonImage as Mock).mockRejectedValue(err)

      moonController.start()
      await vi.waitFor(() => {
        expect(mockErrorDisplay.show).toHaveBeenCalledWith('nasa-moon', err)
      })
    })

    it('should show error on each failing tick', async () => {
      ;(mockNasaMoonService.getCurrentMoonImage as Mock).mockRejectedValue(
        new Error('fail'),
      )

      moonController.start()
      await vi.waitFor(() => {
        expect(mockErrorDisplay.show).toHaveBeenCalledOnce()
      })

      await vi.advanceTimersByTimeAsync(7200000) // 2 hours

      expect(mockErrorDisplay.show).toHaveBeenCalledTimes(3) // initial + 2 ticks
    })

    it('should remove error when fetch recovers after failure', async () => {
      ;(mockNasaMoonService.getCurrentMoonImage as Mock)
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue({
          url: 'https://svs.gsfc.nasa.gov/moon.jpg',
          width: 730,
          height: 730,
          alt_text: 'Moon',
        })

      moonController.start()
      await vi.waitFor(() => {
        expect(mockErrorDisplay.show).toHaveBeenCalledOnce()
      })

      await vi.advanceTimersByTimeAsync(3600000) // 1 hour

      expect(mockErrorDisplay.remove).toHaveBeenCalledWith('nasa-moon')
    })

    it('should only remove error once after recovery', async () => {
      ;(mockNasaMoonService.getCurrentMoonImage as Mock)
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue({
          url: 'https://svs.gsfc.nasa.gov/moon.jpg',
          width: 730,
          height: 730,
          alt_text: 'Moon',
        })

      moonController.start()
      await vi.waitFor(() => {
        expect(mockErrorDisplay.show).toHaveBeenCalledOnce()
      })

      await vi.advanceTimersByTimeAsync(7200000) // 2 hours

      expect(mockErrorDisplay.remove).toHaveBeenCalledOnce()
    })

    it('should not remove error on successful tick not preceded by failure', async () => {
      moonController.start()
      await vi.waitFor(() => {
        expect(mockMoonView.render).toHaveBeenCalled()
      })

      await vi.advanceTimersByTimeAsync(7200000)

      expect(mockErrorDisplay.remove).not.toHaveBeenCalled()
    })

    it('should not call view render when fetch fails', async () => {
      ;(mockNasaMoonService.getCurrentMoonImage as Mock).mockRejectedValue(
        new Error('fail'),
      )

      moonController.start()
      await vi.waitFor(() => {
        expect(mockErrorDisplay.show).toHaveBeenCalled()
      })

      expect(mockMoonView.render).not.toHaveBeenCalled()
    })
  })
})
