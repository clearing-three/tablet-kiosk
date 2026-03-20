/**
 * IconMapper Unit Tests
 *
 * Comprehensive tests for weather icon mapping utilities including:
 * - All OpenWeatherMap icon codes map correctly
 * - Fallback behavior for unknown codes
 * - Case sensitivity handling
 * - Path generation and validation
 */

import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  mapOWMIconToSVG,
  getWeatherIconPath,
  getAllIconMappings,
  hasIconMapping,
  type OWMIconCode,
  type LocalIconName,
} from '../../src/utils/iconMapper'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
        "Unknown OpenWeatherMap icon code: unknown-code, using fallback 'na'"
      )

      consoleSpy.mockRestore()
    })
  })

  describe('getWeatherIconPath', () => {
    it('should generate correct path with default base path', () => {
      expect(getWeatherIconPath('01d')).toBe('weather-icons/clear-day.svg')
      expect(getWeatherIconPath('10n')).toBe('weather-icons/rain.svg')
    })

    it('should generate correct path with custom base path', () => {
      expect(getWeatherIconPath('01d', '/assets/icons')).toBe(
        '/assets/icons/clear-day.svg'
      )
      expect(getWeatherIconPath('11n', 'public/weather')).toBe(
        'public/weather/thunderstorms-night.svg'
      )
    })

    it('should handle fallback icons in path generation', () => {
      expect(getWeatherIconPath('invalid-code')).toBe('weather-icons/na.svg')
      expect(getWeatherIconPath('99x', '/custom/path')).toBe(
        '/custom/path/na.svg'
      )
    })

    it('should handle empty base path', () => {
      expect(getWeatherIconPath('01d', '')).toBe('/clear-day.svg')
    })

    it('should handle base path without leading slash', () => {
      expect(getWeatherIconPath('01d', 'icons')).toBe('icons/clear-day.svg')
    })
  })

  describe('getAllIconMappings', () => {
    it('should return all icon mappings', () => {
      const mappings = getAllIconMappings()

      // Verify it returns an object
      expect(typeof mappings).toBe('object')
      expect(mappings).not.toBeNull()
    })

    it('should contain all expected OWM icon codes', () => {
      const mappings = getAllIconMappings()
      const expectedCodes: OWMIconCode[] = [
        '01d',
        '01n',
        '02d',
        '02n',
        '03d',
        '03n',
        '04d',
        '04n',
        '09d',
        '09n',
        '10d',
        '10n',
        '11d',
        '11n',
        '13d',
        '13n',
        '50d',
        '50n',
      ]

      expectedCodes.forEach(code => {
        expect(mappings).toHaveProperty(code)
      })
    })

    it('should return a copy, not the original object', () => {
      const mappings1 = getAllIconMappings()
      const mappings2 = getAllIconMappings()

      // Should be equal but not the same reference
      expect(mappings1).toEqual(mappings2)
      expect(mappings1).not.toBe(mappings2)
    })

    it('should map to valid local icon names', () => {
      const mappings = getAllIconMappings()
      const validLocalIcons: LocalIconName[] = [
        'clear-day',
        'clear-night',
        'partly-cloudy-day',
        'partly-cloudy-night',
        'overcast',
        'rain',
        'thunderstorms-day',
        'thunderstorms-night',
        'snow',
        'mist',
        'na',
      ]

      Object.values(mappings).forEach(localIcon => {
        expect(validLocalIcons).toContain(localIcon)
      })
    })
  })

  describe('hasIconMapping', () => {
    it('should return true for all valid OWM icon codes', () => {
      const validCodes = [
        '01d',
        '01n',
        '02d',
        '02n',
        '03d',
        '03n',
        '04d',
        '04n',
        '09d',
        '09n',
        '10d',
        '10n',
        '11d',
        '11n',
        '13d',
        '13n',
        '50d',
        '50n',
      ]

      validCodes.forEach(code => {
        expect(hasIconMapping(code)).toBe(true)
      })
    })

    it('should return false for invalid icon codes', () => {
      const invalidCodes = [
        'invalid',
        '99x',
        '',
        '01X',
        '1d',
        'clear',
        'rain',
        'snow',
        'CLEAR',
        '01D',
      ]

      invalidCodes.forEach(code => {
        expect(hasIconMapping(code)).toBe(false)
      })
    })

    it('should return false for null and undefined', () => {
      expect(hasIconMapping(null as any)).toBe(false)
      expect(hasIconMapping(undefined as any)).toBe(false)
    })

    it('should be case sensitive', () => {
      expect(hasIconMapping('01d')).toBe(true)
      expect(hasIconMapping('01D')).toBe(false)
      expect(hasIconMapping('01N')).toBe(false)
    })
  })

  describe('comprehensive icon mapping validation', () => {
    it('should have consistent day/night pairs for weather conditions', () => {
      const mappings = getAllIconMappings()

      // Clear sky should have different day/night icons
      expect(mappings['01d']).toBe('clear-day')
      expect(mappings['01n']).toBe('clear-night')

      // Few clouds should have different day/night icons
      expect(mappings['02d']).toBe('partly-cloudy-day')
      expect(mappings['02n']).toBe('partly-cloudy-night')

      // Scattered clouds should have different day/night icons
      expect(mappings['03d']).toBe('partly-cloudy-day')
      expect(mappings['03n']).toBe('partly-cloudy-night')

      // Thunderstorms should have different day/night icons
      expect(mappings['11d']).toBe('thunderstorms-day')
      expect(mappings['11n']).toBe('thunderstorms-night')
    })

    it('should have same icons for day/night when appropriate', () => {
      const mappings = getAllIconMappings()

      // These conditions should look the same day or night
      expect(mappings['04d']).toBe(mappings['04n']) // broken clouds
      expect(mappings['09d']).toBe(mappings['09n']) // shower rain
      expect(mappings['10d']).toBe(mappings['10n']) // rain
      expect(mappings['13d']).toBe(mappings['13n']) // snow
      expect(mappings['50d']).toBe(mappings['50n']) // mist
    })

    it('should cover all weather condition categories', () => {
      const mappings = getAllIconMappings()
      const iconNames = Object.values(mappings)
      const uniqueIcons = [...new Set(iconNames)]

      // Should include all major weather categories
      expect(uniqueIcons).toContain('clear-day')
      expect(uniqueIcons).toContain('clear-night')
      expect(uniqueIcons).toContain('partly-cloudy-day')
      expect(uniqueIcons).toContain('partly-cloudy-night')
      expect(uniqueIcons).toContain('overcast')
      expect(uniqueIcons).toContain('rain')
      expect(uniqueIcons).toContain('thunderstorms-day')
      expect(uniqueIcons).toContain('thunderstorms-night')
      expect(uniqueIcons).toContain('snow')
      expect(uniqueIcons).toContain('mist')
    })
  })

  describe('integration with icon files', () => {
    it('should generate valid SVG file extensions', () => {
      const testCodes = ['01d', '10n', '11d', 'invalid']

      testCodes.forEach(code => {
        const path = getWeatherIconPath(code)
        expect(path).toMatch(/\.svg$/)
      })
    })

    it('should handle various base path formats', () => {
      expect(getWeatherIconPath('01d', 'path/')).toBe('path//clear-day.svg')
      expect(getWeatherIconPath('01d', '/path')).toBe('/path/clear-day.svg')
      expect(getWeatherIconPath('01d', '/path/')).toBe('/path//clear-day.svg')
      expect(getWeatherIconPath('01d', 'path')).toBe('path/clear-day.svg')
    })

    it('should have an SVG file for each mapped icon', () => {
      const iconMappings = getAllIconMappings()
      const uniqueIcons = new Set(Object.values(iconMappings))
      const missingIcons: string[] = []

      uniqueIcons.forEach(iconName => {
        // Path from test file: tests/utils/ -> ../../public/weather-icons/
        const filePath = join(
          __dirname,
          '../../public/weather-icons',
          `${iconName}.svg`
        )
        if (!existsSync(filePath)) {
          missingIcons.push(iconName)
        }
      })

      expect(missingIcons).toEqual([])
    })
  })
})
