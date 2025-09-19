/**
 * Environment Configuration Module
 * Validates and provides type-safe access to environment variables
 */

export interface EnvironmentConfig {
  openWeatherApiKey: string
  location: {
    lat: string
    lon: string
  }
  intervals: {
    weatherUpdate: number
    clockUpdate: number
  }
}

/**
 * Validates that a required environment variable exists and is not empty
 */
function validateRequiredEnvVar(
  name: string,
  value: string | undefined
): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `Required environment variable ${name} is not set or is empty`
    )
  }
  return value.trim()
}

/**
 * Validates that a numeric environment variable is a valid number
 */
function validateNumericEnvVar(
  name: string,
  value: string | undefined,
  defaultValue: number
): number {
  if (!value) {
    return defaultValue
  }

  const numValue = parseInt(value, 10)
  if (isNaN(numValue) || numValue <= 0) {
    throw new Error(
      `Environment variable ${name} must be a positive number, got: ${value}`
    )
  }

  return numValue
}

/**
 * Validates and loads environment configuration
 * Throws an error if required variables are missing or invalid
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  try {
    const config: EnvironmentConfig = {
      openWeatherApiKey: validateRequiredEnvVar(
        'VITE_OPENWEATHER_API_KEY',
        import.meta.env.VITE_OPENWEATHER_API_KEY
      ),
      location: {
        lat: validateRequiredEnvVar(
          'VITE_LOCATION_LAT',
          import.meta.env.VITE_LOCATION_LAT
        ),
        lon: validateRequiredEnvVar(
          'VITE_LOCATION_LON',
          import.meta.env.VITE_LOCATION_LON
        ),
      },
      intervals: {
        weatherUpdate: validateNumericEnvVar(
          'VITE_WEATHER_UPDATE_INTERVAL',
          import.meta.env.VITE_WEATHER_UPDATE_INTERVAL,
          600000 // 10 minutes default
        ),
        clockUpdate: validateNumericEnvVar(
          'VITE_CLOCK_UPDATE_INTERVAL',
          import.meta.env.VITE_CLOCK_UPDATE_INTERVAL,
          1000 // 1 second default
        ),
      },
    }

    // Additional validation for API key format (basic check)
    if (config.openWeatherApiKey.length < 32) {
      console.warn(
        'OpenWeatherMap API key appears to be too short. Please verify it is correct.'
      )
    }

    // Validate location coordinates
    const lat = parseFloat(config.location.lat)
    const lon = parseFloat(config.location.lon)

    if (isNaN(lat) || lat < -90 || lat > 90) {
      throw new Error(
        `Invalid latitude: ${config.location.lat}. Must be between -90 and 90.`
      )
    }

    if (isNaN(lon) || lon < -180 || lon > 180) {
      throw new Error(
        `Invalid longitude: ${config.location.lon}. Must be between -180 and 180.`
      )
    }

    return config
  } catch (error) {
    console.error('Environment configuration validation failed:', error)
    throw error
  }
}

/**
 * Gets the current environment configuration
 * Call this once during application initialization
 */
export const environment = loadEnvironmentConfig()

/**
 * Helper function to check if we're in development mode
 */
export const isDevelopment = import.meta.env.DEV

/**
 * Helper function to check if we're in production mode
 */
export const isProduction = import.meta.env.PROD
