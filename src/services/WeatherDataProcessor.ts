/**
 * Weather Data Processor
 *
 * Transforms raw weather API data into component-friendly structures.
 * Handles data processing, formatting, and icon mapping.
 * All provider-specific details are encapsulated within this processor.
 */

import type { WeatherApiData } from '../types/weather-api.types'
import type { WeatherData } from '../types/weather-domain.types'
import { REQUIRED_FORECAST_DAYS } from '../constants/weather.constants'
import { mapOWMIconToSVG } from '../utils/iconMapper'

export class WeatherDataProcessor {
  /**
   * Processes raw weather data into format suitable for UI components.
   * Maps provider-specific icon codes to standard icon names internally.
   * @param data Raw weather data from API (assumed to be validated by Zod)
   * @returns WeatherData Processed data ready for display
   */
  processWeatherData(data: WeatherApiData): WeatherData {
    const current = data.current
    const todaysForecast = data.daily[0]!

    // Process current weather
    const currentWeather = {
      temperature: Math.round(current.temp),
      feelsLike: Math.round(current.feels_like),
      description: current.weather[0]!.description,
      icon: mapOWMIconToSVG(current.weather[0]!.icon),
      minTemp: Math.round(todaysForecast.temp.min),
      maxTemp: Math.round(todaysForecast.temp.max),
      windSpeed: Math.round(current.wind_speed),
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][
        Math.round(current.wind_deg / 45) % 8
      ]!,
      windGust:
        current.wind_gust !== undefined
          ? Math.round(current.wind_gust)
          : undefined,
    }

    // Process forecast (next 3 days, skipping today)
    const forecast = data.daily.slice(1, REQUIRED_FORECAST_DAYS).map((day) => {
      const date = new Date(day.dt * 1000)
      return {
        dayName: date.toLocaleDateString(undefined, { weekday: 'short' }),
        icon: mapOWMIconToSVG(day.weather[0]!.icon),
        description: day.weather[0]!.description,
        maxTemp: Math.round(day.temp.max),
        minTemp: Math.round(day.temp.min),
        date,
      }
    })

    // Process astronomy data
    const astronomy = {
      sunrise: current.sunrise,
      sunset: current.sunset,
    }

    return {
      current: currentWeather,
      forecast,
      astronomy,
    }
  }
}
