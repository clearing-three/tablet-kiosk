/**
 * AstronomyTimes Component Tests (3.5.3)
 *
 * Tests for AstronomyTimes component covering:
 * - Time display formatting
 */

import { AstronomyTimes } from '../../src/components/Astronomy/AstronomyTimes'
import { formatTimeFromUnix } from '../../src/utils/formatters'
import type { SolarTimes as AstronomyData } from '../../src/types/astronomy.types'

// Fixed Unix timestamps for deterministic tests
const SUNRISE = 1700030400 // 06:00
const SUNSET = 1700073600 // 18:00

describe('AstronomyTimes', () => {
  let astronomyTimes: AstronomyTimes
  let mockData: AstronomyData

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="sunrise-time"></div>
      <div id="sunset-time"></div>
    `
    astronomyTimes = new AstronomyTimes()
    mockData = {
      sunrise: SUNRISE,
      sunset: SUNSET,
    }
  })

  describe('constructor', () => {
    it('should throw when required DOM elements are missing', () => {
      document.body.innerHTML = ''

      expect(() => new AstronomyTimes()).toThrow(
        'Required DOM element not found'
      )
    })

    it('should throw indicating which element is missing', () => {
      document.body.innerHTML = '<div id="sunrise-time"></div>'

      expect(() => new AstronomyTimes()).toThrow('#sunset-time')
    })
  })

  describe('time display formatting', () => {
    it('should update sunrise and sunset elements with formatted times', () => {
      astronomyTimes.updateTimes(mockData)

      expect(document.getElementById('sunrise-time')!.textContent).toBe(
        formatTimeFromUnix(SUNRISE)
      )
      expect(document.getElementById('sunset-time')!.textContent).toBe(
        formatTimeFromUnix(SUNSET)
      )
    })

    it('should overwrite previous values on subsequent calls', () => {
      astronomyTimes.updateTimes(mockData)

      const updatedData: AstronomyData = { ...mockData, sunrise: SUNSET }
      astronomyTimes.updateTimes(updatedData)

      expect(document.getElementById('sunrise-time')!.textContent).toBe(
        formatTimeFromUnix(SUNSET)
      )
    })
  })
})
