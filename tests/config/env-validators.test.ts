/**
 * Unit tests for src/config/env-validators.ts
 *
 * Tests the pure validation helpers:
 *   - validateRequiredEnvVar
 *   - validateNumericEnvVar
 *   - validateLatitude
 *   - validateLongitude
 *   - checkApiKeyLength
 */

import {
  validateRequiredEnvVar,
  validateNumericEnvVar,
  validateLatitude,
  validateLongitude,
  checkApiKeyLength,
} from '../../src/config/env-validators'

describe('validateRequiredEnvVar', () => {
  it('throws when value is undefined', () => {
    expect(() => validateRequiredEnvVar('MY_VAR', undefined)).toThrow(
      'Required environment variable MY_VAR is not set or is empty'
    )
  })

  it('throws when value is an empty string', () => {
    expect(() => validateRequiredEnvVar('MY_VAR', '')).toThrow(
      'Required environment variable MY_VAR is not set or is empty'
    )
  })

  it('throws when value is whitespace only', () => {
    expect(() => validateRequiredEnvVar('MY_VAR', '   ')).toThrow(
      'Required environment variable MY_VAR is not set or is empty'
    )
  })

  it('returns the value when valid', () => {
    expect(validateRequiredEnvVar('MY_VAR', 'hello')).toBe('hello')
  })

  it('trims surrounding whitespace from a valid value', () => {
    expect(validateRequiredEnvVar('MY_VAR', '  hello  ')).toBe('hello')
  })

  it('includes the variable name in the error message', () => {
    expect(() =>
      validateRequiredEnvVar('VITE_OPENWEATHER_API_KEY', undefined)
    ).toThrow('VITE_OPENWEATHER_API_KEY')
  })
})

describe('validateNumericEnvVar', () => {
  it('returns the default when value is undefined', () => {
    expect(validateNumericEnvVar('INTERVAL', undefined, 600000)).toBe(600000)
  })

  it('returns the default when value is an empty string', () => {
    expect(validateNumericEnvVar('INTERVAL', '', 1000)).toBe(1000)
  })

  it('parses and returns a valid positive integer', () => {
    expect(validateNumericEnvVar('INTERVAL', '300000', 600000)).toBe(300000)
  })

  it('throws when value is not a number', () => {
    expect(() => validateNumericEnvVar('INTERVAL', 'abc', 600000)).toThrow(
      'Environment variable INTERVAL must be a positive number, got: abc'
    )
  })

  it('throws when value is zero', () => {
    expect(() => validateNumericEnvVar('INTERVAL', '0', 600000)).toThrow(
      'Environment variable INTERVAL must be a positive number, got: 0'
    )
  })

  it('throws when value is negative', () => {
    expect(() => validateNumericEnvVar('INTERVAL', '-1', 600000)).toThrow(
      'Environment variable INTERVAL must be a positive number, got: -1'
    )
  })

  it('includes the variable name in the error message', () => {
    expect(() =>
      validateNumericEnvVar('VITE_WEATHER_UPDATE_INTERVAL', 'bad', 600000)
    ).toThrow('VITE_WEATHER_UPDATE_INTERVAL')
  })
})

describe('validateLatitude', () => {
  it('does not throw for a valid latitude', () => {
    expect(() => validateLatitude('40.7128')).not.toThrow()
  })

  it('does not throw at the upper boundary (90)', () => {
    expect(() => validateLatitude('90')).not.toThrow()
  })

  it('does not throw at the lower boundary (-90)', () => {
    expect(() => validateLatitude('-90')).not.toThrow()
  })

  it('throws for latitude above 90', () => {
    expect(() => validateLatitude('91')).toThrow(
      'Invalid latitude: 91. Must be between -90 and 90.'
    )
  })

  it('throws for latitude below -90', () => {
    expect(() => validateLatitude('-91')).toThrow(
      'Invalid latitude: -91. Must be between -90 and 90.'
    )
  })

  it('throws for a non-numeric string', () => {
    expect(() => validateLatitude('not-a-number')).toThrow(
      'Invalid latitude: not-a-number. Must be between -90 and 90.'
    )
  })
})

describe('validateLongitude', () => {
  it('does not throw for a valid longitude', () => {
    expect(() => validateLongitude('-74.0060')).not.toThrow()
  })

  it('does not throw at the upper boundary (180)', () => {
    expect(() => validateLongitude('180')).not.toThrow()
  })

  it('does not throw at the lower boundary (-180)', () => {
    expect(() => validateLongitude('-180')).not.toThrow()
  })

  it('throws for longitude above 180', () => {
    expect(() => validateLongitude('181')).toThrow(
      'Invalid longitude: 181. Must be between -180 and 180.'
    )
  })

  it('throws for longitude below -180', () => {
    expect(() => validateLongitude('-181')).toThrow(
      'Invalid longitude: -181. Must be between -180 and 180.'
    )
  })

  it('throws for a non-numeric string', () => {
    expect(() => validateLongitude('not-a-number')).toThrow(
      'Invalid longitude: not-a-number. Must be between -180 and 180.'
    )
  })
})

describe('checkApiKeyLength', () => {
  let warnSpy: jest.SpyInstance

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('warns when the key is shorter than 32 characters', () => {
    checkApiKeyLength('short-key')
    expect(warnSpy).toHaveBeenCalledWith(
      'OpenWeatherMap API key appears to be too short. Please verify it is correct.'
    )
  })

  it('warns when the key is exactly 31 characters', () => {
    checkApiKeyLength('a'.repeat(31))
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it('does not warn when the key is exactly 32 characters', () => {
    checkApiKeyLength('a'.repeat(32))
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('does not warn when the key is longer than 32 characters', () => {
    checkApiKeyLength('a'.repeat(40))
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
