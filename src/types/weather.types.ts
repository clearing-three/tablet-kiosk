/**
 * TypeScript interfaces for OpenWeatherMap One Call 3.0 API
 *
 * These interfaces define the structure of weather data received from
 * the OpenWeatherMap One Call 3.0 API, including current conditions,
 * daily forecasts, and weather descriptions.
 */

import { z } from 'zod'

const REQUIRED_FORECAST_DAYS = 4

// Individual weather condition object
const WeatherConditionSchema = z.object({
  id: z.number(),
  main: z.string(),
  description: z.string(),
  icon: z.string(),
})

// Temperature object for daily forecasts
const DailyTemperatureSchema = z.object({
  day: z.number(),
  min: z.number(),
  max: z.number(),
  night: z.number(),
  eve: z.number(),
  morn: z.number(),
})

// Feels like temperature object for daily forecasts
const DailyFeelsLikeSchema = z.object({
  day: z.number(),
  night: z.number(),
  eve: z.number(),
  morn: z.number(),
})

// Current weather conditions
const CurrentWeatherSchema = z.object({
  dt: z.number(),
  sunrise: z.number(),
  sunset: z.number(),
  temp: z.number(),
  feels_like: z.number(),
  pressure: z.number(),
  humidity: z.number(),
  dew_point: z.number(),
  uvi: z.number(),
  clouds: z.number(),
  visibility: z.number(),
  wind_speed: z.number(),
  wind_deg: z.number(),
  wind_gust: z.number().optional(),
  weather: z.array(WeatherConditionSchema),
})

// Daily weather forecast
const DailyWeatherSchema = z.object({
  dt: z.number(),
  sunrise: z.number(),
  sunset: z.number(),
  moon_phase: z.number(),
  temp: DailyTemperatureSchema,
  feels_like: DailyFeelsLikeSchema,
  pressure: z.number(),
  humidity: z.number(),
  dew_point: z.number(),
  wind_speed: z.number(),
  wind_deg: z.number(),
  wind_gust: z.number().optional(),
  weather: z.array(WeatherConditionSchema),
  clouds: z.number(),
  pop: z.number(),
  rain: z.number().optional(),
  snow: z.number().optional(),
  uvi: z.number(),
})

// Complete API response structure
export const WeatherDataSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  timezone: z.string(),
  timezone_offset: z.number(),
  current: CurrentWeatherSchema,
  daily: z.array(DailyWeatherSchema).min(REQUIRED_FORECAST_DAYS),
})

export type WeatherData = z.infer<typeof WeatherDataSchema>
export type WeatherCondition = z.infer<typeof WeatherConditionSchema>
export type DailyTemperature = z.infer<typeof DailyTemperatureSchema>
export type DailyFeelsLike = z.infer<typeof DailyFeelsLikeSchema>
export type CurrentWeather = z.infer<typeof CurrentWeatherSchema>
export type DailyWeather = z.infer<typeof DailyWeatherSchema>

// Simplified weather data for component consumption
export interface ProcessedWeatherData {
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

// API error response
export interface WeatherApiError {
  cod: string | number
  message: string
}
