/**
 * Service Configuration Types
 *
 * Defines configuration interfaces for all service classes to support dependency injection.
 * This removes direct environment variable dependencies and improves testability.
 */

/**
 * Configuration for WeatherService
 */
export interface WeatherServiceConfig {
  /** OpenWeatherMap API key */
  apiKey: string
  /** Latitude coordinate */
  latitude: string
  /** Longitude coordinate */
  longitude: string
  /** Temperature units (imperial, metric, kelvin) */
  units: 'imperial' | 'metric' | 'kelvin'
  /** Language code for weather descriptions */
  language?: string
}

/**
 * Configuration for TimeService
 */
export interface TimeServiceConfig {
  /** Clock update interval in milliseconds */
  clockUpdateInterval: number
  /** Weather update interval in milliseconds */
  weatherUpdateInterval: number
}
