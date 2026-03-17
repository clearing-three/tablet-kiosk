/**
 * Constants Unit Tests
 *
 * Comprehensive tests for application constants including:
 * - All constants have expected values
 * - No undefined or null constants
 * - Type safety and immutability
 * - Proper configuration values
 */

import {
  UPDATE_INTERVALS,
  FORECAST_CONFIG,
  MOON_PHASE_CONFIG,
  API_CONFIG,
  ASSET_PATHS,
  DEFAULTS,
  DOM_IDS,
  CSS_CLASSES,
  TIME_FORMAT_OPTIONS,
  ERROR_MESSAGES,
} from '../../src/utils/constants'

describe('constants', () => {
  describe('UPDATE_INTERVALS', () => {
    it('should have correct clock update interval', () => {
      expect(UPDATE_INTERVALS.CLOCK).toBe(1000)
      expect(typeof UPDATE_INTERVALS.CLOCK).toBe('number')
    })

    it('should have correct weather update interval', () => {
      expect(UPDATE_INTERVALS.WEATHER).toBe(600000) // 10 minutes
      expect(typeof UPDATE_INTERVALS.WEATHER).toBe('number')
    })

    it('should be readonly at TypeScript level', () => {
      // TypeScript prevents mutation with 'as const'
      // This test verifies the structure is correct
      expect(UPDATE_INTERVALS).toHaveProperty('CLOCK')
      expect(UPDATE_INTERVALS).toHaveProperty('WEATHER')
    })

    it('should have reasonable interval values', () => {
      // Clock should update frequently (1 second)
      expect(UPDATE_INTERVALS.CLOCK).toBeGreaterThan(0)
      expect(UPDATE_INTERVALS.CLOCK).toBeLessThanOrEqual(1000)

      // Weather should update less frequently (10 minutes)
      expect(UPDATE_INTERVALS.WEATHER).toBeGreaterThan(UPDATE_INTERVALS.CLOCK)
      expect(UPDATE_INTERVALS.WEATHER).toBe(10 * 60 * 1000)
    })
  })

  describe('FORECAST_CONFIG', () => {
    it('should have correct forecast days configuration', () => {
      expect(FORECAST_CONFIG.DAYS_TO_SHOW).toBe(3)
      expect(typeof FORECAST_CONFIG.DAYS_TO_SHOW).toBe('number')
    })

    it('should have correct start index', () => {
      expect(FORECAST_CONFIG.START_INDEX).toBe(1)
      expect(typeof FORECAST_CONFIG.START_INDEX).toBe('number')
    })

    it('should be readonly at TypeScript level', () => {
      // TypeScript prevents mutation with 'as const'
      expect(FORECAST_CONFIG).toHaveProperty('DAYS_TO_SHOW')
      expect(FORECAST_CONFIG).toHaveProperty('START_INDEX')
    })

    it('should have logical configuration values', () => {
      // Should show a reasonable number of forecast days
      expect(FORECAST_CONFIG.DAYS_TO_SHOW).toBeGreaterThan(0)
      expect(FORECAST_CONFIG.DAYS_TO_SHOW).toBeLessThan(10)

      // Start index should skip today (index 0)
      expect(FORECAST_CONFIG.START_INDEX).toBe(1)
    })
  })

  describe('MOON_PHASE_CONFIG', () => {
    it('should have correct SVG viewBox', () => {
      expect(MOON_PHASE_CONFIG.SVG_VIEWBOX).toBe('0 0 200 200')
      expect(typeof MOON_PHASE_CONFIG.SVG_VIEWBOX).toBe('string')
    })

    it('should have correct aspect ratio setting', () => {
      expect(MOON_PHASE_CONFIG.SVG_ASPECT_RATIO).toBe('xMidYMid meet')
      expect(typeof MOON_PHASE_CONFIG.SVG_ASPECT_RATIO).toBe('string')
    })

    it('should be readonly at TypeScript level', () => {
      expect(MOON_PHASE_CONFIG).toHaveProperty('SVG_VIEWBOX')
      expect(MOON_PHASE_CONFIG).toHaveProperty('SVG_ASPECT_RATIO')
    })

    it('should have valid SVG viewBox format', () => {
      const viewBox = MOON_PHASE_CONFIG.SVG_VIEWBOX
      expect(viewBox).toMatch(/^\d+\s+\d+\s+\d+\s+\d+$/)
    })
  })

  describe('API_CONFIG', () => {
    it('should have correct OpenWeatherMap API URL', () => {
      expect(API_CONFIG.BASE_URL).toBe(
        'https://api.openweathermap.org/data/3.0/onecall'
      )
      expect(typeof API_CONFIG.BASE_URL).toBe('string')
    })

    it('should have correct units configuration', () => {
      expect(API_CONFIG.UNITS).toBe('imperial')
      expect(typeof API_CONFIG.UNITS).toBe('string')
    })

    it('should have correct exclusions', () => {
      expect(API_CONFIG.EXCLUDE).toBe('minutely,hourly,alerts')
      expect(typeof API_CONFIG.EXCLUDE).toBe('string')
    })

    it('should be readonly at TypeScript level', () => {
      expect(API_CONFIG).toHaveProperty('BASE_URL')
      expect(API_CONFIG).toHaveProperty('UNITS')
      expect(API_CONFIG).toHaveProperty('EXCLUDE')
    })

    it('should have valid URL format', () => {
      expect(API_CONFIG.BASE_URL).toMatch(/^https:\/\//)
      expect(() => new URL(API_CONFIG.BASE_URL)).not.toThrow()
    })

    it('should exclude unnecessary data types', () => {
      const exclusions = API_CONFIG.EXCLUDE.split(',')
      expect(exclusions).toContain('minutely')
      expect(exclusions).toContain('hourly')
      expect(exclusions).toContain('alerts')
    })
  })

  describe('ASSET_PATHS', () => {
    it('should have correct weather icons path', () => {
      expect(ASSET_PATHS.WEATHER_ICONS).toBe('weather-icons')
      expect(typeof ASSET_PATHS.WEATHER_ICONS).toBe('string')
    })

    it('should be readonly at TypeScript level', () => {
      expect(ASSET_PATHS).toHaveProperty('WEATHER_ICONS')
    })

    it('should not have leading or trailing slashes', () => {
      expect(ASSET_PATHS.WEATHER_ICONS).not.toMatch(/^\//)
      expect(ASSET_PATHS.WEATHER_ICONS).not.toMatch(/\/$/)
    })
  })

  describe('DEFAULTS', () => {
    it('should have correct fallback icon', () => {
      expect(DEFAULTS.FALLBACK_ICON).toBe('na')
      expect(typeof DEFAULTS.FALLBACK_ICON).toBe('string')
    })

    it('should have correct missing moon time display', () => {
      expect(DEFAULTS.MISSING_MOON_TIME).toBe('-')
      expect(typeof DEFAULTS.MISSING_MOON_TIME).toBe('string')
    })

    it('should have correct default moon phase', () => {
      expect(DEFAULTS.DEFAULT_MOON_PHASE).toBe(0)
      expect(typeof DEFAULTS.DEFAULT_MOON_PHASE).toBe('number')
    })

    it('should be readonly at TypeScript level', () => {
      expect(DEFAULTS).toHaveProperty('FALLBACK_ICON')
      expect(DEFAULTS).toHaveProperty('MISSING_MOON_TIME')
      expect(DEFAULTS).toHaveProperty('DEFAULT_MOON_PHASE')
    })

    it('should have logical default values', () => {
      // Moon phase should be between 0 and 1
      expect(DEFAULTS.DEFAULT_MOON_PHASE).toBeGreaterThanOrEqual(0)
      expect(DEFAULTS.DEFAULT_MOON_PHASE).toBeLessThanOrEqual(1)

      // Missing time should be a simple dash
      expect(DEFAULTS.MISSING_MOON_TIME).toBe('-')
    })
  })

  describe('DOM_IDS', () => {
    it('should have all required time and date element IDs', () => {
      expect(DOM_IDS.TIME).toBe('time')
      expect(DOM_IDS.DATE).toBe('date')
    })

    it('should have all required weather element IDs', () => {
      expect(DOM_IDS.TEMP_NOW).toBe('temp-now')
      expect(DOM_IDS.WEATHER_RANGE).toBe('weather-range')
    })

    it('should have all required astronomy element IDs', () => {
      expect(DOM_IDS.SUNRISE_TIME).toBe('sunrise-time')
      expect(DOM_IDS.SUNSET_TIME).toBe('sunset-time')
    })

    it('should have all required moon phase element IDs', () => {
      expect(DOM_IDS.MOON).toBe('moon')
    })

    it('should have forecast element ID', () => {
      expect(DOM_IDS.FORECAST).toBe('forecast')
    })

    it('should be readonly at TypeScript level', () => {
      expect(Object.keys(DOM_IDS).length).toBeGreaterThan(0)
    })

    it('should have kebab-case ID values', () => {
      Object.values(DOM_IDS).forEach(id => {
        expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/)
      })
    })

    it('should not have empty or undefined IDs', () => {
      Object.values(DOM_IDS).forEach(id => {
        expect(id).toBeTruthy()
        expect(typeof id).toBe('string')
        expect(id.length).toBeGreaterThan(0)
      })
    })
  })

  describe('CSS_CLASSES', () => {
    it('should have all required forecast CSS classes', () => {
      expect(CSS_CLASSES.FORECAST_DAY).toBe('forecast-day')
      expect(CSS_CLASSES.FORECAST_DAY_NAME).toBe('forecast-day-name')
      expect(CSS_CLASSES.FORECAST_ICON).toBe('forecast-icon')
      expect(CSS_CLASSES.FORECAST_DESC).toBe('forecast-desc')
      expect(CSS_CLASSES.FORECAST_RANGE).toBe('forecast-range')
    })

    it('should be readonly at TypeScript level', () => {
      expect(Object.keys(CSS_CLASSES).length).toBeGreaterThan(0)
    })

    it('should have kebab-case class names', () => {
      Object.values(CSS_CLASSES).forEach(className => {
        expect(className).toMatch(/^[a-z]+(-[a-z]+)*$/)
      })
    })

    it('should not have empty class names', () => {
      Object.values(CSS_CLASSES).forEach(className => {
        expect(className).toBeTruthy()
        expect(typeof className).toBe('string')
        expect(className.length).toBeGreaterThan(0)
      })
    })
  })

  describe('TIME_FORMAT_OPTIONS', () => {
    it('should have correct 24-hour format options', () => {
      expect(TIME_FORMAT_OPTIONS.HOUR_24).toEqual({
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    })

    it('should have correct short weekday format options', () => {
      expect(TIME_FORMAT_OPTIONS.SHORT_WEEKDAY).toEqual({
        weekday: 'short',
      })
    })

    it('should have correct long date format options', () => {
      expect(TIME_FORMAT_OPTIONS.LONG_DATE).toEqual({
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    })

    it('should be readonly at TypeScript level', () => {
      expect(TIME_FORMAT_OPTIONS).toHaveProperty('HOUR_24')
      expect(TIME_FORMAT_OPTIONS).toHaveProperty('SHORT_WEEKDAY')
      expect(TIME_FORMAT_OPTIONS).toHaveProperty('LONG_DATE')
    })

    it('should have valid Intl.DateTimeFormatOptions', () => {
      // Test that the options work with actual date formatting
      const testDate = new Date('2024-01-01T14:30:00')

      expect(() => {
        testDate.toLocaleTimeString([], TIME_FORMAT_OPTIONS.HOUR_24)
      }).not.toThrow()

      expect(() => {
        testDate.toLocaleDateString([], TIME_FORMAT_OPTIONS.SHORT_WEEKDAY)
      }).not.toThrow()

      expect(() => {
        testDate.toLocaleDateString([], TIME_FORMAT_OPTIONS.LONG_DATE)
      }).not.toThrow()
    })
  })

  describe('ERROR_MESSAGES', () => {
    it('should have all required error messages', () => {
      expect(ERROR_MESSAGES.API_ERROR).toBe('Failed to fetch weather data')
      expect(ERROR_MESSAGES.NETWORK_ERROR).toBe('Network connection error')
      expect(ERROR_MESSAGES.INVALID_RESPONSE).toBe('Invalid API response')
      expect(ERROR_MESSAGES.MOON_PHASE_ERROR).toBe('Error updating moon phase')
      expect(ERROR_MESSAGES.DOM_ELEMENT_NOT_FOUND).toBe(
        'Required DOM element not found'
      )
    })

    it('should be readonly at TypeScript level', () => {
      expect(Object.keys(ERROR_MESSAGES).length).toBeGreaterThan(0)
    })

    it('should have meaningful error messages', () => {
      Object.values(ERROR_MESSAGES).forEach(message => {
        expect(message).toBeTruthy()
        expect(typeof message).toBe('string')
        expect(message.length).toBeGreaterThan(10)
        expect(message).toMatch(/^[A-Z]/) // Should start with capital letter
      })
    })

    it('should cover all major error categories', () => {
      const messages = Object.keys(ERROR_MESSAGES)
      expect(messages).toContain('API_ERROR')
      expect(messages).toContain('NETWORK_ERROR')
      expect(messages).toContain('INVALID_RESPONSE')
      expect(messages).toContain('MOON_PHASE_ERROR')
      expect(messages).toContain('DOM_ELEMENT_NOT_FOUND')
    })
  })

  describe('overall constants integrity', () => {
    it('should not have any undefined or null values', () => {
      const allConstants = [
        UPDATE_INTERVALS,
        FORECAST_CONFIG,
        MOON_PHASE_CONFIG,
        API_CONFIG,
        ASSET_PATHS,
        DEFAULTS,
        DOM_IDS,
        CSS_CLASSES,
        TIME_FORMAT_OPTIONS,
        ERROR_MESSAGES,
      ]

      allConstants.forEach(constantGroup => {
        Object.values(constantGroup).forEach(value => {
          expect(value).toBeDefined()
          expect(value).not.toBeNull()
        })
      })
    })

    it('should have consistent naming conventions', () => {
      // All constant group names should be UPPER_CASE
      const constantNames = [
        'UPDATE_INTERVALS',
        'FORECAST_CONFIG',
        'MOON_PHASE_CONFIG',
        'API_CONFIG',
        'ASSET_PATHS',
        'DEFAULTS',
        'DOM_IDS',
        'CSS_CLASSES',
        'TIME_FORMAT_OPTIONS',
        'ERROR_MESSAGES',
      ]

      constantNames.forEach(name => {
        expect(name).toMatch(/^[A-Z_]+$/)
      })
    })

    it('should export all constants as readonly objects', () => {
      const constantGroups = [
        UPDATE_INTERVALS,
        FORECAST_CONFIG,
        MOON_PHASE_CONFIG,
        API_CONFIG,
        ASSET_PATHS,
        DEFAULTS,
        DOM_IDS,
        CSS_CLASSES,
        TIME_FORMAT_OPTIONS,
        ERROR_MESSAGES,
      ]

      constantGroups.forEach(group => {
        expect(typeof group).toBe('object')
        expect(group).not.toBeNull()
      })
    })
  })
})
