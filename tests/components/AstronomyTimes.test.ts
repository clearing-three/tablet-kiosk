/**
 * AstronomyTimes Component Tests (3.5.3)
 *
 * Tests for AstronomyTimes component covering:
 * - Time display formatting
 * - Handling of missing moonrise/moonset ("-" display)
 */

import { AstronomyTimes } from '../../src/components/Astronomy/AstronomyTimes'
import { formatTimeFromUnix } from '../../src/utils/formatters'
import type { AstronomyTimes as AstronomyData } from '../../src/types/astronomy.types'

// Fixed Unix timestamps for deterministic tests
const SUNRISE = 1700030400 // 06:00
const SUNSET = 1700073600 // 18:00
const MOONRISE = 1700041200 // 09:00
const MOONSET = 1700084400 // 21:00

describe('AstronomyTimes', () => {
  let astronomyTimes: AstronomyTimes
  let mockData: AstronomyData

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="sunrise-time"></div>
      <div id="sunset-time"></div>
      <div id="moonrise-time"></div>
      <div id="moonset-time"></div>
    `
    astronomyTimes = new AstronomyTimes()
    mockData = {
      sunrise: SUNRISE,
      sunset: SUNSET,
      moonrise: MOONRISE,
      moonset: MOONSET,
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
    it('should update all four elements with formatted times', () => {
      astronomyTimes.updateTimes(mockData)

      expect(document.getElementById('sunrise-time')!.textContent).toBe(
        formatTimeFromUnix(SUNRISE)
      )
      expect(document.getElementById('sunset-time')!.textContent).toBe(
        formatTimeFromUnix(SUNSET)
      )
      expect(document.getElementById('moonrise-time')!.textContent).toBe(
        formatTimeFromUnix(MOONRISE)
      )
      expect(document.getElementById('moonset-time')!.textContent).toBe(
        formatTimeFromUnix(MOONSET)
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

  describe('missing moonrise/moonset handling', () => {
    it('should display "-" when moonrise is 0', () => {
      astronomyTimes.updateTimes({ ...mockData, moonrise: 0 })

      expect(document.getElementById('moonrise-time')!.textContent).toBe('-')
    })

    it('should display "-" when moonset is 0', () => {
      astronomyTimes.updateTimes({ ...mockData, moonset: 0 })

      expect(document.getElementById('moonset-time')!.textContent).toBe('-')
    })

    it('should display "-" for both when both moon times are 0', () => {
      astronomyTimes.updateTimes({ ...mockData, moonrise: 0, moonset: 0 })

      expect(document.getElementById('moonrise-time')!.textContent).toBe('-')
      expect(document.getElementById('moonset-time')!.textContent).toBe('-')
    })

    it('should still format sunrise and sunset normally when moon times are 0', () => {
      astronomyTimes.updateTimes({ ...mockData, moonrise: 0, moonset: 0 })

      expect(document.getElementById('sunrise-time')!.textContent).toBe(
        formatTimeFromUnix(SUNRISE)
      )
      expect(document.getElementById('sunset-time')!.textContent).toBe(
        formatTimeFromUnix(SUNSET)
      )
    })
  })

  describe('data validation and error propagation', () => {
    it('should throw with a descriptive message when data is null', () => {
      expect(() =>
        astronomyTimes.updateTimes(null as unknown as AstronomyData)
      ).toThrow('Astronomy data is null or undefined')
    })

    it('should throw with a descriptive message when a field is not a number', () => {
      expect(() =>
        astronomyTimes.updateTimes({
          ...mockData,
          sunrise: 'invalid' as unknown as number,
        })
      ).toThrow('Invalid astronomy data: sunrise is not a number')
    })

    it('should throw with a descriptive message when sunrise is zero or negative', () => {
      expect(() =>
        astronomyTimes.updateTimes({ ...mockData, sunrise: 0 })
      ).toThrow('Invalid astronomy data: sunrise or sunset is zero or negative')
    })

    it('should throw with a descriptive message when sunset is zero or negative', () => {
      expect(() =>
        astronomyTimes.updateTimes({ ...mockData, sunset: 0 })
      ).toThrow('Invalid astronomy data: sunrise or sunset is zero or negative')
    })
  })

  describe('getCurrentDisplayValues', () => {
    it('should return current DOM values after update', () => {
      astronomyTimes.updateTimes(mockData)

      const values = astronomyTimes.getCurrentDisplayValues()

      expect(values.sunrise).toBe(formatTimeFromUnix(SUNRISE))
      expect(values.sunset).toBe(formatTimeFromUnix(SUNSET))
      expect(values.moonrise).toBe(formatTimeFromUnix(MOONRISE))
      expect(values.moonset).toBe(formatTimeFromUnix(MOONSET))
    })

    it('should return "-" for moon times when they are 0', () => {
      astronomyTimes.updateTimes({ ...mockData, moonrise: 0, moonset: 0 })

      const values = astronomyTimes.getCurrentDisplayValues()

      expect(values.moonrise).toBe('-')
      expect(values.moonset).toBe('-')
    })
  })
})
