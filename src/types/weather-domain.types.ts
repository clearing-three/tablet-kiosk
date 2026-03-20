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

// Simplified weather data for component consumption
export interface WeatherData {
  current: {
    temperature: number
    feelsLike: number
    description: string
    iconCode: string
    minTemp: number
    maxTemp: number
    windSpeed: number
    windDirection: string
    windGust?: number
  }
  forecast: Array<{
    dayName: string
    iconCode: string
    description: string
    maxTemp: number
    minTemp: number
    date: Date
  }>
  astronomy: {
    sunrise: number // Unix timestamp
    sunset: number // Unix timestamp
    moonPhase: number // Moon phase value 0-1
  }
}
