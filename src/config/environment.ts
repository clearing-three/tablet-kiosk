/**
 * Environment Configuration Module
 * Validates and provides type-safe access to environment variables
 * Exports individual service configurations for dependency injection
 */

import type {
  WeatherServiceConfig,
  TimeServiceConfig,
  MoonPhaseServiceConfig,
} from '../types/service-config.types'
import {
  validateRequiredEnvVar,
  validateNumericEnvVar,
  validateLatitude,
  validateLongitude,
  checkApiKeyLength,
} from './env-validators'

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

    checkApiKeyLength(config.openWeatherApiKey)
    validateLatitude(config.location.lat)
    validateLongitude(config.location.lon)

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
 * Creates WeatherServiceConfig from environment variables
 */
export function createWeatherServiceConfig(): WeatherServiceConfig {
  const env = loadEnvironmentConfig()
  return {
    apiKey: env.openWeatherApiKey,
    latitude: env.location.lat,
    longitude: env.location.lon,
    units: 'imperial', // Default to imperial units
    language: 'en', // Default to English
  }
}

/**
 * Creates TimeServiceConfig from environment variables
 */
export function createTimeServiceConfig(): TimeServiceConfig {
  const env = loadEnvironmentConfig()
  return {
    clockUpdateInterval: env.intervals.clockUpdate,
    weatherUpdateInterval: env.intervals.weatherUpdate,
  }
}

/**
 * Creates MoonPhaseServiceConfig from environment variables
 */
export function createMoonPhaseServiceConfig(): MoonPhaseServiceConfig {
  // No environment variables needed for MoonPhaseService currently
  return {}
}

/**
 * Service configuration objects for dependency injection
 */
export const weatherServiceConfig = createWeatherServiceConfig()
export const timeServiceConfig = createTimeServiceConfig()
export const moonPhaseServiceConfig = createMoonPhaseServiceConfig()

/**
 * Helper function to check if we're in development mode
 */
export const isDevelopment = import.meta.env.DEV

/**
 * Helper function to check if we're in production mode
 */
export const isProduction = import.meta.env.PROD
