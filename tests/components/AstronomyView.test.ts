/**
 * AstronomyView Component Tests (3.5.3)
 *
 * Tests for AstronomyView component covering:
 * - Time display formatting
 */

import { AstronomyView } from '../../src/components/Astronomy/AstronomyView'
import { formatTimeFromUnix } from '../../src/utils/formatters'
import type { SolarTimes as AstronomyData } from '../../src/types/weather-domain.types'

// Fixed Unix timestamps for deterministic tests
const SUNRISE = 1700030400 // 06:00
const SUNSET = 1700073600 // 18:00

describe('AstronomyView', () => {
  let astronomyView: AstronomyView
  let mockData: AstronomyData

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="sunrise-time"></div>
      <div id="sunset-time"></div>
    `
    astronomyView = new AstronomyView()
    mockData = {
      sunrise: SUNRISE,
      sunset: SUNSET,
    }
  })

  describe('constructor', () => {
    it('should throw when required DOM elements are missing', () => {
      document.body.innerHTML = ''

      expect(() => new AstronomyView()).toThrow(
        'Required DOM element not found'
      )
    })

    it('should throw indicating which element is missing', () => {
      document.body.innerHTML = '<div id="sunrise-time"></div>'

      expect(() => new AstronomyView()).toThrow('#sunset-time')
    })
  })

  describe('time display formatting', () => {
    it('should update sunrise and sunset elements with formatted times', () => {
      astronomyView.render(mockData)

      expect(document.getElementById('sunrise-time')!.textContent).toBe(
        formatTimeFromUnix(SUNRISE)
      )
      expect(document.getElementById('sunset-time')!.textContent).toBe(
        formatTimeFromUnix(SUNSET)
      )
    })

    it('should overwrite previous values on subsequent calls', () => {
      astronomyView.render(mockData)

      const updatedData: AstronomyData = { ...mockData, sunrise: SUNSET }
      astronomyView.render(updatedData)

      expect(document.getElementById('sunrise-time')!.textContent).toBe(
        formatTimeFromUnix(SUNSET)
      )
    })
  })
})
