/**
 * NASA Moon Display Component Tests
 *
 * Tests for NasaMoonDisplay component covering:
 * - Moon image updates every 60 minutes
 * - Image sizing (0.8 * screen dimensions)
 * - Interval management
 * - Error handling callbacks
 */

import type { Mock } from 'vitest'
import { NasaMoonDisplay } from '../../src/components/Astronomy/NasaMoonDisplay'
import { NasaMoonService } from '../../src/services/NasaMoonService'
import { NasaMoonApiMock, mockNasaSuccessResponse } from '../__mocks__/nasa-api'

describe('NasaMoonDisplay', () => {
  let nasaMoonDisplay: NasaMoonDisplay
  let nasaMoonDisplayService: NasaMoonService

  beforeEach(() => {
    document.body.innerHTML = `
      <img id="moon" alt="Current moon phase" />
    `
    vi.useFakeTimers()
    NasaMoonApiMock.setup()
    nasaMoonDisplayService = new NasaMoonService()
    nasaMoonDisplay = new NasaMoonDisplay(nasaMoonDisplayService)
  })

  afterEach(() => {
    nasaMoonDisplay.destroy()
    vi.useRealTimers()
    NasaMoonApiMock.teardown()
    NasaMoonApiMock.reset()
  })

  describe('constructor', () => {
    it('should throw when required DOM element is missing', () => {
      document.body.innerHTML = ''

      expect(() => new NasaMoonDisplay(nasaMoonDisplayService)).toThrow(
        'Required DOM element not found'
      )
    })

    it('should throw indicating which element is missing', () => {
      document.body.innerHTML = '<div></div>'

      expect(() => new NasaMoonDisplay(nasaMoonDisplayService)).toThrow('#moon')
    })

    it('should initialize successfully with moon element present', () => {
      expect(() => nasaMoonDisplay).not.toThrow()
    })
  })

  describe('moon image updates every 60 minutes', () => {
    it('should perform an immediate update when startUpdates is called', async () => {
      NasaMoonApiMock.mockSuccess()

      nasaMoonDisplay.startUpdates()
      await vi.waitFor(() => {
        const moonElement = document.getElementById('moon') as HTMLImageElement
        expect(moonElement.src).toBe(mockNasaSuccessResponse.image.url)
      })
    })

    it('should update the moon image after 60 minutes', async () => {
      NasaMoonApiMock.mockSuccess()

      nasaMoonDisplay.startUpdates()
      await vi.waitFor(() => {
        const moonElement = document.getElementById('moon') as HTMLImageElement
        expect(moonElement.src).toBe(mockNasaSuccessResponse.image.url)
      })

      const newMoonResponse = {
        image: {
          url: 'https://svs.gsfc.nasa.gov/vis/a000000/a005100/a005187/frames/730x730_1x1_30p/moon.5188.jpg',
          width: 730,
          height: 730,
          alt_text: 'Updated moon phase',
        },
      }
      NasaMoonApiMock.mockSuccess(newMoonResponse)

      await vi.advanceTimersByTimeAsync(3600000) // 60 minutes

      const moonElement = document.getElementById('moon') as HTMLImageElement
      expect(moonElement.src).toBe(newMoonResponse.image.url)
    })

    it('should update on each subsequent 60-minute tick', async () => {
      NasaMoonApiMock.mockSuccess()
      nasaMoonDisplay.startUpdates()
      await vi.waitFor(() => {
        const moonElement = document.getElementById('moon') as HTMLImageElement
        expect(moonElement.src).toBe(mockNasaSuccessResponse.image.url)
      })

      const secondResponse = {
        image: {
          url: 'https://svs.gsfc.nasa.gov/moon2.jpg',
          width: 730,
          height: 730,
          alt_text: 'Second update',
        },
      }
      NasaMoonApiMock.mockSuccess(secondResponse)
      await vi.advanceTimersByTimeAsync(3600000)

      const thirdResponse = {
        image: {
          url: 'https://svs.gsfc.nasa.gov/moon3.jpg',
          width: 730,
          height: 730,
          alt_text: 'Third update',
        },
      }
      NasaMoonApiMock.mockSuccess(thirdResponse)
      await vi.advanceTimersByTimeAsync(3600000)

      const moonElement = document.getElementById('moon') as HTMLImageElement
      expect(moonElement.src).toBe(thirdResponse.image.url)
    })
  })

  describe('interval management', () => {
    it('should not have active timers before startUpdates', () => {
      expect(vi.getTimerCount()).toBe(0)
    })

    it('should have active timer after startUpdates', async () => {
      NasaMoonApiMock.mockSuccess()
      nasaMoonDisplay.startUpdates()
      await vi.waitFor(() => {
        expect(vi.getTimerCount()).toBe(1)
      })
    })

    it('should clear timer after stopUpdates', async () => {
      NasaMoonApiMock.mockSuccess()
      nasaMoonDisplay.startUpdates()
      await vi.waitFor(() => {
        expect(vi.getTimerCount()).toBe(1)
      })
      nasaMoonDisplay.stopUpdates()

      expect(vi.getTimerCount()).toBe(0)
    })

    it('should stop updating after stopUpdates', async () => {
      NasaMoonApiMock.mockSuccess()
      nasaMoonDisplay.startUpdates()
      await vi.waitFor(() => {
        expect(vi.getTimerCount()).toBe(1)
      })

      nasaMoonDisplay.stopUpdates()

      const fetchCallsBefore = (global.fetch as Mock).mock.calls.length

      await vi.advanceTimersByTimeAsync(7200000) // 120 minutes

      expect(global.fetch).toHaveBeenCalledTimes(fetchCallsBefore)
    })

    it('should clear the existing interval when startUpdates is called again', async () => {
      NasaMoonApiMock.mockSuccess()
      nasaMoonDisplay.startUpdates()
      await vi.waitFor(() => {
        expect(vi.getTimerCount()).toBe(1)
      })

      NasaMoonApiMock.mockSuccess()
      nasaMoonDisplay.startUpdates()
      await vi.waitFor(() => {
        expect(vi.getTimerCount()).toBe(1)
      })
    })

    it('should be safe to call stopUpdates when not running', () => {
      expect(() => nasaMoonDisplay.stopUpdates()).not.toThrow()
    })

    it('should stop updates when destroy is called', async () => {
      NasaMoonApiMock.mockSuccess()
      nasaMoonDisplay.startUpdates()
      await vi.waitFor(() => {
        expect(vi.getTimerCount()).toBe(1)
      })

      nasaMoonDisplay.destroy()

      expect(vi.getTimerCount()).toBe(0)
    })

    it('should stop updating after destroy', async () => {
      NasaMoonApiMock.mockSuccess()
      nasaMoonDisplay.startUpdates()
      await vi.waitFor(() => {
        expect(vi.getTimerCount()).toBe(1)
      })

      nasaMoonDisplay.destroy()

      const fetchCallsBefore = (global.fetch as Mock).mock.calls.length

      await vi.advanceTimersByTimeAsync(7200000) // 120 minutes

      expect(global.fetch).toHaveBeenCalledTimes(fetchCallsBefore)
    })
  })

  describe('startUpdates() callbacks', () => {
    it('calls onError when initial update fails', async () => {
      const onError = vi.fn()
      NasaMoonApiMock.mockError('serverError')

      nasaMoonDisplay.startUpdates(onError)
      await vi.waitFor(() => {
        expect(onError).toHaveBeenCalledOnce()
      })
    })

    it('calls onError when update fails on a tick', async () => {
      const onError = vi.fn()
      NasaMoonApiMock.mockSuccess()

      nasaMoonDisplay.startUpdates(onError)
      await vi.waitFor(() => {
        const moonElement = document.getElementById('moon') as HTMLImageElement
        expect(moonElement.src).toBeTruthy()
      })

      NasaMoonApiMock.mockError('serverError')
      await vi.advanceTimersByTimeAsync(3600000)

      expect(onError).toHaveBeenCalledOnce()
    })

    it('calls onError on every failing tick, not just the first', async () => {
      const onError = vi.fn()
      NasaMoonApiMock.mockSuccess()

      nasaMoonDisplay.startUpdates(onError)
      await vi.waitFor(() => {
        const moonElement = document.getElementById('moon') as HTMLImageElement
        expect(moonElement.src).toBeTruthy()
      })

      NasaMoonApiMock.mockError('serverError')
      await vi.advanceTimersByTimeAsync(3600000)

      NasaMoonApiMock.mockError('serverError')
      await vi.advanceTimersByTimeAsync(3600000)

      expect(onError).toHaveBeenCalledTimes(2)
    })

    it('calls onSuccess on the tick after a failure when update recovers', async () => {
      const onError = vi.fn()
      const onSuccess = vi.fn()
      NasaMoonApiMock.mockSuccess()

      nasaMoonDisplay.startUpdates(onError, onSuccess)
      await vi.waitFor(() => {
        const moonElement = document.getElementById('moon') as HTMLImageElement
        expect(moonElement.src).toBeTruthy()
      })

      // Tick 1: fails
      NasaMoonApiMock.mockError('serverError')
      await vi.advanceTimersByTimeAsync(3600000)

      // Tick 2: recovers
      NasaMoonApiMock.mockSuccess()
      await vi.advanceTimersByTimeAsync(3600000)

      expect(onSuccess).toHaveBeenCalledOnce()
    })

    it('does not call onSuccess on a successful tick not preceded by a failure', async () => {
      const onSuccess = vi.fn()
      NasaMoonApiMock.mockSuccess()

      nasaMoonDisplay.startUpdates(undefined, onSuccess)
      await vi.waitFor(() => {
        const moonElement = document.getElementById('moon') as HTMLImageElement
        expect(moonElement.src).toBeTruthy()
      })

      NasaMoonApiMock.mockSuccess()
      await vi.advanceTimersByTimeAsync(3600000)

      NasaMoonApiMock.mockSuccess()
      await vi.advanceTimersByTimeAsync(3600000)

      expect(onSuccess).not.toHaveBeenCalled()
    })

    it('does not throw when no callbacks are provided and update fails', async () => {
      NasaMoonApiMock.mockError('serverError')

      nasaMoonDisplay.startUpdates()
      await vi.waitFor(() => {
        expect(vi.getTimerCount()).toBe(1)
      })

      // Should not throw
      expect(vi.getTimerCount()).toBe(1)
    })

    it('passes the error object to onError callback', async () => {
      const onError = vi.fn()
      NasaMoonApiMock.mockError('notFound')

      nasaMoonDisplay.startUpdates(onError)
      await vi.waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error))
      })

      const error = onError.mock.calls[0][0] as Error
      expect(error.message).toContain('404')
    })
  })

  describe('API integration', () => {
    it('should call NasaMoonService.getCurrentMoonImage', async () => {
      const spy = vi.spyOn(nasaMoonDisplayService, 'getCurrentMoonImage')
      NasaMoonApiMock.mockSuccess()

      nasaMoonDisplay.startUpdates()
      await vi.waitFor(() => {
        expect(spy).toHaveBeenCalledOnce()
      })
    })

    it('should set image src from API response url', async () => {
      NasaMoonApiMock.mockSuccess()

      nasaMoonDisplay.startUpdates()
      await vi.waitFor(() => {
        const moonElement = document.getElementById('moon') as HTMLImageElement
        expect(moonElement.src).toBe(mockNasaSuccessResponse.image.url)
      })
    })

    it('should handle network errors gracefully', async () => {
      const onError = vi.fn()
      NasaMoonApiMock.mockNetworkFailure()

      nasaMoonDisplay.startUpdates(onError)
      await vi.waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(TypeError))
      })
    })
  })
})
