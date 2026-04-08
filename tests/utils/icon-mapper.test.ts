/**
 * IconMapper Unit Tests
 *
 * Comprehensive tests for weather icon mapping utilities including:
 * - All OpenWeatherMap icon codes map correctly
 * - Fallback behavior for unknown codes
 * - Case sensitivity handling
 */

import { mapOWMIconToSVG } from '../../src/utils/icon-mapper'

describe('iconMapper', () => {
  describe('mapOWMIconToSVG', () => {
    it('should map all valid clear sky icons correctly', () => {
      expect(mapOWMIconToSVG('01d')).toBe('clear-day')
      expect(mapOWMIconToSVG('01n')).toBe('clear-night')
    })

    it('should map all valid few clouds icons correctly', () => {
      expect(mapOWMIconToSVG('02d')).toBe('partly-cloudy-day')
      expect(mapOWMIconToSVG('02n')).toBe('partly-cloudy-night')
    })

    it('should map all valid scattered clouds icons correctly', () => {
      expect(mapOWMIconToSVG('03d')).toBe('partly-cloudy-day')
      expect(mapOWMIconToSVG('03n')).toBe('partly-cloudy-night')
    })

    it('should map all valid broken clouds icons correctly', () => {
      expect(mapOWMIconToSVG('04d')).toBe('overcast')
      expect(mapOWMIconToSVG('04n')).toBe('overcast')
    })

    it('should map all valid shower rain icons correctly', () => {
      expect(mapOWMIconToSVG('09d')).toBe('rain')
      expect(mapOWMIconToSVG('09n')).toBe('rain')
    })

    it('should map all valid rain icons correctly', () => {
      expect(mapOWMIconToSVG('10d')).toBe('rain')
      expect(mapOWMIconToSVG('10n')).toBe('rain')
    })

    it('should map all valid thunderstorm icons correctly', () => {
      expect(mapOWMIconToSVG('11d')).toBe('thunderstorms-day')
      expect(mapOWMIconToSVG('11n')).toBe('thunderstorms-night')
    })

    it('should map all valid snow icons correctly', () => {
      expect(mapOWMIconToSVG('13d')).toBe('snow')
      expect(mapOWMIconToSVG('13n')).toBe('snow')
    })

    it('should map all valid mist icons correctly', () => {
      expect(mapOWMIconToSVG('50d')).toBe('mist')
      expect(mapOWMIconToSVG('50n')).toBe('mist')
    })

    it('should return fallback for unknown icon codes', () => {
      expect(mapOWMIconToSVG('99x')).toBe('na')
      expect(mapOWMIconToSVG('invalid')).toBe('na')
      expect(mapOWMIconToSVG('')).toBe('na')
    })

    it('should handle case sensitivity correctly', () => {
      // OWM codes are case-sensitive and should be lowercase
      expect(mapOWMIconToSVG('01D')).toBe('na')
      expect(mapOWMIconToSVG('01N')).toBe('na')
      expect(mapOWMIconToSVG('CLEAR')).toBe('na')
    })

    it('should handle null and undefined inputs', () => {
      expect(mapOWMIconToSVG(null as any)).toBe('na')
      expect(mapOWMIconToSVG(undefined as any)).toBe('na')
    })

    it('should warn for unknown codes', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mapOWMIconToSVG('unknown-code')

      expect(consoleSpy).toHaveBeenCalledWith(
        'Unknown OpenWeatherMap icon code: unknown-code, using fallback \'na\'',
      )

      consoleSpy.mockRestore()
    })
  })

  describe('comprehensive icon mapping validation', () => {
    it('should have consistent day/night pairs for weather conditions', () => {
      // Clear sky should have different day/night icons
      expect(mapOWMIconToSVG('01d')).toBe('clear-day')
      expect(mapOWMIconToSVG('01n')).toBe('clear-night')

      // Few clouds should have different day/night icons
      expect(mapOWMIconToSVG('02d')).toBe('partly-cloudy-day')
      expect(mapOWMIconToSVG('02n')).toBe('partly-cloudy-night')

      // Scattered clouds should have different day/night icons
      expect(mapOWMIconToSVG('03d')).toBe('partly-cloudy-day')
      expect(mapOWMIconToSVG('03n')).toBe('partly-cloudy-night')

      // Thunderstorms should have different day/night icons
      expect(mapOWMIconToSVG('11d')).toBe('thunderstorms-day')
      expect(mapOWMIconToSVG('11n')).toBe('thunderstorms-night')
    })

    it('should have same icons for day/night when appropriate', () => {
      // These conditions should look the same day or night
      expect(mapOWMIconToSVG('04d')).toBe(mapOWMIconToSVG('04n')) // broken clouds
      expect(mapOWMIconToSVG('09d')).toBe(mapOWMIconToSVG('09n')) // shower rain
      expect(mapOWMIconToSVG('10d')).toBe(mapOWMIconToSVG('10n')) // rain
      expect(mapOWMIconToSVG('13d')).toBe(mapOWMIconToSVG('13n')) // snow
      expect(mapOWMIconToSVG('50d')).toBe(mapOWMIconToSVG('50n')) // mist
    })
  })
})
