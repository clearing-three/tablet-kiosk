/**
 * NasaMoonService Unit Tests
 *
 * Comprehensive tests for NasaMoonService functionality including:
 * - Timestamp formatting
 * - Successful API calls with proper data validation
 * - Error handling for network failures and invalid responses
 */

import type { Mock } from 'vitest'
import { NasaMoonService } from '../../src/services/NasaMoonService'
import { NasaMoonApiMock, mockNasaSuccessResponse } from '../__mocks__/nasa-api'

describe('NasaMoonService', () => {
  let nasaMoonService: NasaMoonService

  beforeEach(() => {
    nasaMoonService = new NasaMoonService()
    NasaMoonApiMock.setup()
  })

  afterEach(() => {
    NasaMoonApiMock.teardown()
    NasaMoonApiMock.reset()
  })

  describe('Timestamp Formatting', () => {
    it('should format timestamp to YYYY-MM-DDTHH:MM format in UTC', () => {
      const date = new Date('2026-03-13T15:30:45.123Z')
      const formatted = nasaMoonService.formatTimestamp(date)

      expect(formatted).toBe('2026-03-13T15:30')
    })

    it('should format midnight correctly', () => {
      const date = new Date('2026-01-01T00:00:00.000Z')
      const formatted = nasaMoonService.formatTimestamp(date)

      expect(formatted).toBe('2026-01-01T00:00')
    })

    it('should format end of day correctly', () => {
      const date = new Date('2026-12-31T23:59:59.999Z')
      const formatted = nasaMoonService.formatTimestamp(date)

      expect(formatted).toBe('2026-12-31T23:59')
    })

    it('should pad single-digit months and days with zeros', () => {
      const date = new Date('2026-01-05T03:07:00.000Z')
      const formatted = nasaMoonService.formatTimestamp(date)

      expect(formatted).toBe('2026-01-05T03:07')
    })
  })

  describe('Successful API Calls', () => {
    it('should fetch moon image data for a given date', async () => {
      NasaMoonApiMock.mockSuccess()
      const date = new Date('2026-03-13T15:30:00.000Z')

      const result = await nasaMoonService.fetchMoonImage(date)

      expect(result).toEqual(mockNasaSuccessResponse.image)
      expect(result.url).toBeDefined()
      expect(result.width).toBe(730)
      expect(result.height).toBe(730)
      expect(result.alt_text).toBeDefined()
    })

    it('should build correct API URL', async () => {
      NasaMoonApiMock.mockSuccess()
      const date = new Date('2026-03-13T15:30:00.000Z')

      await nasaMoonService.fetchMoonImage(date)

      expect(global.fetch).toHaveBeenCalledTimes(1)
      const fetchCall = (global.fetch as Mock).mock.calls[0][0]

      expect(fetchCall).toBe(
        'https://svs.gsfc.nasa.gov/api/dialamoon/2026-03-13T15:30'
      )
    })

    it('should fetch current moon image', async () => {
      NasaMoonApiMock.mockSuccess()

      const result = await nasaMoonService.getCurrentMoonImage()

      expect(result).toEqual(mockNasaSuccessResponse.image)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should return valid moon image structure', async () => {
      NasaMoonApiMock.mockSuccess()

      const result = await nasaMoonService.getCurrentMoonImage()

      expect(typeof result.url).toBe('string')
      expect(typeof result.width).toBe('number')
      expect(typeof result.height).toBe('number')
      expect(typeof result.alt_text).toBe('string')
    })
  })

  describe('Error Handling', () => {
    it('should handle HTTP 404 Not Found errors', async () => {
      NasaMoonApiMock.mockError('notFound')

      await expect(nasaMoonService.getCurrentMoonImage()).rejects.toThrow(
        NasaMoonService.Errors.httpError(404, 'Not Found')
      )
    })

    it('should handle HTTP 500 Server errors', async () => {
      NasaMoonApiMock.mockError('serverError')

      await expect(nasaMoonService.getCurrentMoonImage()).rejects.toThrow(
        NasaMoonService.Errors.httpError(500, 'Internal Server Error')
      )
    })

    it('should handle network failures', async () => {
      NasaMoonApiMock.mockNetworkFailure()

      await expect(nasaMoonService.getCurrentMoonImage()).rejects.toThrow(
        TypeError
      )
    })

    it('should handle invalid JSON responses', async () => {
      NasaMoonApiMock.mockError('invalidJson')

      await expect(nasaMoonService.getCurrentMoonImage()).rejects.toThrow(
        SyntaxError
      )
    })

    it('should handle missing image object in response', async () => {
      NasaMoonApiMock.mockEdgeCase('missingImage')

      await expect(nasaMoonService.getCurrentMoonImage()).rejects.toThrow(
        NasaMoonService.Errors.missingImageData
      )
    })

    it('should handle missing url in image object', async () => {
      NasaMoonApiMock.mockEdgeCase('missingUrl')

      await expect(nasaMoonService.getCurrentMoonImage()).rejects.toThrow(
        NasaMoonService.Errors.missingImageUrl
      )
    })

    it('should handle invalid url type in image object', async () => {
      NasaMoonApiMock.mockEdgeCase('invalidUrlType')

      await expect(nasaMoonService.getCurrentMoonImage()).rejects.toThrow(
        NasaMoonService.Errors.missingImageUrl
      )
    })
  })

  describe('Date Handling Edge Cases', () => {
    it('should handle dates across different years', async () => {
      NasaMoonApiMock.mockSuccess()
      const date = new Date('2025-12-31T23:59:00.000Z')

      await nasaMoonService.fetchMoonImage(date)

      const fetchCall = (global.fetch as Mock).mock.calls[0][0]
      expect(fetchCall).toContain('2025-12-31T23:59')
    })

    it('should handle dates in the past', async () => {
      NasaMoonApiMock.mockSuccess()
      const date = new Date('2020-01-01T12:00:00.000Z')

      await nasaMoonService.fetchMoonImage(date)

      const fetchCall = (global.fetch as Mock).mock.calls[0][0]
      expect(fetchCall).toContain('2020-01-01T12:00')
    })

    it('should handle dates in the future', async () => {
      NasaMoonApiMock.mockSuccess()
      const date = new Date('2030-06-15T18:45:00.000Z')

      await nasaMoonService.fetchMoonImage(date)

      const fetchCall = (global.fetch as Mock).mock.calls[0][0]
      expect(fetchCall).toContain('2030-06-15T18:45')
    })

    it('should handle leap year dates', async () => {
      NasaMoonApiMock.mockSuccess()
      const date = new Date('2024-02-29T12:00:00.000Z')

      await nasaMoonService.fetchMoonImage(date)

      const fetchCall = (global.fetch as Mock).mock.calls[0][0]
      expect(fetchCall).toContain('2024-02-29T12:00')
    })
  })

  describe('Multiple Calls', () => {
    it('should handle multiple sequential calls', async () => {
      NasaMoonApiMock.mockSuccess()
      await nasaMoonService.getCurrentMoonImage()

      NasaMoonApiMock.mockSuccess()
      await nasaMoonService.getCurrentMoonImage()

      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should maintain independence between calls', async () => {
      NasaMoonApiMock.mockSuccess()
      const result1 = await nasaMoonService.fetchMoonImage(
        new Date('2026-03-13T10:00:00.000Z')
      )

      NasaMoonApiMock.mockSuccess()
      const result2 = await nasaMoonService.fetchMoonImage(
        new Date('2026-03-14T10:00:00.000Z')
      )

      expect(result1).toEqual(mockNasaSuccessResponse.image)
      expect(result2).toEqual(mockNasaSuccessResponse.image)

      const call1 = (global.fetch as Mock).mock.calls[0][0]
      const call2 = (global.fetch as Mock).mock.calls[1][0]

      expect(call1).toContain('2026-03-13T10:00')
      expect(call2).toContain('2026-03-14T10:00')
    })
  })
})
