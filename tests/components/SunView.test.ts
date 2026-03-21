/**
 * SunView Component Tests (3.5.3)
 *
 * Tests for SunView component covering:
 * - Time display formatting
 */

import { SunView } from '../../src/components/Astronomy/SunView'
import { formatTimeFromUnix } from '../../src/utils/formatters'
import type { SolarTimes as AstronomyData } from '../../src/types/weather-domain.types'

// Fixed Unix timestamps for deterministic tests
const SUNRISE = 1700030400 // 06:00
const SUNSET = 1700073600 // 18:00

describe('SunView', () => {
  let sunView: SunView
  let mockData: AstronomyData

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="sunrise-time"></div>
      <div id="sunset-time"></div>
    `
    sunView = new SunView()
    mockData = {
      sunrise: SUNRISE,
      sunset: SUNSET,
    }
  })

  describe('constructor', () => {
    it('should throw when required DOM elements are missing', () => {
      document.body.innerHTML = ''

      expect(() => new SunView()).toThrow('Required DOM element not found')
    })

    it('should throw indicating which element is missing', () => {
      document.body.innerHTML = '<div id="sunrise-time"></div>'

      expect(() => new SunView()).toThrow('#sunset-time')
    })
  })

  describe('time display formatting', () => {
    it('should update sunrise and sunset elements with formatted times', () => {
      sunView.render(mockData)

      expect(document.getElementById('sunrise-time')!.textContent).toBe(
        formatTimeFromUnix(SUNRISE)
      )
      expect(document.getElementById('sunset-time')!.textContent).toBe(
        formatTimeFromUnix(SUNSET)
      )
    })

    it('should overwrite previous values on subsequent calls', () => {
      sunView.render(mockData)

      const updatedData: AstronomyData = { ...mockData, sunrise: SUNSET }
      sunView.render(updatedData)

      expect(document.getElementById('sunrise-time')!.textContent).toBe(
        formatTimeFromUnix(SUNSET)
      )
    })
  })
})
