/**
 * Domain types for weather data
 *
 * These types represent processed weather data used throughout the application,
 * transformed from raw API responses into component-friendly structures.
 */

// Solar times (sunrise and sunset) for a given day
export interface SolarTimes {
  sunrise: number // Unix timestamp
  sunset: number // Unix timestamp
}

/**
 * Weather icon names for standard weather conditions.
 * These are provider-agnostic icon identifiers mapped from API responses.
 */
export type WeatherIcon
  = | 'clear-day'
    | 'clear-night'
    | 'partly-cloudy-day'
    | 'partly-cloudy-night'
    | 'overcast'
    | 'rain'
    | 'thunderstorms-day'
    | 'thunderstorms-night'
    | 'snow'
    | 'mist'
    | 'na' // fallback for unknown conditions

// Simplified weather data for component consumption
export interface WeatherData {
  current: {
    temperature: number
    feelsLike: number
    description: string
    icon: WeatherIcon
    minTemp: number
    maxTemp: number
    windSpeed: number
    windDirection: string
    windGust?: number
  }
  forecast: Array<{
    dayName: string
    icon: WeatherIcon
    description: string
    maxTemp: number
    minTemp: number
    date: Date
  }>
  astronomy: {
    sunrise: number // Unix timestamp
    sunset: number // Unix timestamp
  }
}
