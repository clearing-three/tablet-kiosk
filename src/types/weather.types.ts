/**
 * TypeScript interfaces for OpenWeatherMap One Call 3.0 API
 *
 * These interfaces define the structure of weather data received from
 * the OpenWeatherMap One Call 3.0 API, including current conditions,
 * daily forecasts, and weather descriptions.
 */

// Individual weather condition object
export interface WeatherCondition {
  id: number
  main: string
  description: string
  icon: string
}

// Temperature object for daily forecasts
export interface DailyTemperature {
  day: number
  min: number
  max: number
  night: number
  eve: number
  morn: number
}

// Feels like temperature object for daily forecasts
export interface DailyFeelsLike {
  day: number
  night: number
  eve: number
  morn: number
}

// Current weather conditions
export interface CurrentWeather {
  dt: number // Unix timestamp
  sunrise: number // Unix timestamp
  sunset: number // Unix timestamp
  temp: number
  feels_like: number
  pressure: number
  humidity: number
  dew_point: number
  uvi: number
  clouds: number
  visibility: number
  wind_speed: number
  wind_deg: number
  wind_gust?: number
  weather: WeatherCondition[]
}

// Daily weather forecast
export interface DailyWeather {
  dt: number // Unix timestamp
  sunrise: number // Unix timestamp
  sunset: number // Unix timestamp
  moonrise: number // Unix timestamp (0 if no moonrise)
  moonset: number // Unix timestamp (0 if no moonset)
  moon_phase: number // Moon phase value 0-1
  temp: DailyTemperature
  feels_like: DailyFeelsLike
  pressure: number
  humidity: number
  dew_point: number
  wind_speed: number
  wind_deg: number
  wind_gust?: number
  weather: WeatherCondition[]
  clouds: number
  pop: number // Probability of precipitation
  rain?: number // Rain volume (mm)
  snow?: number // Snow volume (mm)
  uvi: number
}

// Complete API response structure
export interface WeatherData {
  lat: number
  lon: number
  timezone: string
  timezone_offset: number
  current: CurrentWeather
  daily: DailyWeather[]
}

// Simplified weather data for component consumption
export interface ProcessedWeatherData {
  current: {
    temperature: number
    description: string
    iconCode: string
    minTemp: number
    maxTemp: number
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
    moonrise: number // Unix timestamp (0 if no moonrise)
    moonset: number // Unix timestamp (0 if no moonset)
    moonPhase: number // Moon phase value 0-1
  }
}

// Weather service configuration
export interface WeatherServiceConfig {
  apiKey: string
  latitude: string
  longitude: string
  units: 'metric' | 'imperial' | 'kelvin'
  language?: string
}

// API error response
export interface WeatherApiError {
  cod: string | number
  message: string
}
