/**
 * Pure environment variable validation utilities
 * Extracted here to enable unit testing without import.meta dependencies
 */

/**
 * Validates that a required environment variable exists and is not empty
 */
export function validateRequiredEnvVar(
  name: string,
  value: string | undefined,
): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `Required environment variable ${name} is not set or is empty`,
    )
  }
  return value.trim()
}

/**
 * Validates that a numeric environment variable is a valid positive number
 */
export function validateNumericEnvVar(
  name: string,
  value: string | undefined,
  defaultValue: number,
): number {
  if (!value) {
    return defaultValue
  }

  const numValue = Number.parseInt(value, 10)
  if (Number.isNaN(numValue) || numValue <= 0) {
    throw new Error(
      `Environment variable ${name} must be a positive number, got: ${value}`,
    )
  }

  return numValue
}

/**
 * Validates a latitude string is within [-90, 90]
 */
export function validateLatitude(lat: string): void {
  const value = Number.parseFloat(lat)
  if (Number.isNaN(value) || value < -90 || value > 90) {
    throw new Error(`Invalid latitude: ${lat}. Must be between -90 and 90.`)
  }
}

/**
 * Validates a longitude string is within [-180, 180]
 */
export function validateLongitude(lon: string): void {
  const value = Number.parseFloat(lon)
  if (Number.isNaN(value) || value < -180 || value > 180) {
    throw new Error(`Invalid longitude: ${lon}. Must be between -180 and 180.`)
  }
}

/**
 * Warns if the OpenWeatherMap API key appears too short
 */
export function checkApiKeyLength(key: string): void {
  if (key.length < 32) {
    console.warn(
      'OpenWeatherMap API key appears to be too short. Please verify it is correct.',
    )
  }
}
