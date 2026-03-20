/**
 * Weather Data Processor
 *
 * Transforms raw OpenWeatherMap API data into component-friendly structures.
 * Handles data processing, formatting, and icon mapping.
 */

import type { WeatherApiData } from '../types/weather-api.types'
import type { WeatherData } from '../types/weather-domain.types'
import { mapOWMIconToSVG } from '../utils/iconMapper'
import { REQUIRED_FORECAST_DAYS } from '../constants/weather.constants'

export class WeatherDataProcessor {
  /**
   * Processes raw weather data into format suitable for UI components
   * @param data Raw weather data from API (assumed to be validated by Zod)
   * @returns WeatherData Processed data ready for display
   */
  processWeatherData(data: WeatherApiData): WeatherData {
    const current = data.current
    const todaysForecast = data.daily[0]

    // Process current weather
    const currentWeather = {
      temperature: Math.round(current.temp),
      feelsLike: Math.round(current.feels_like),
      description: current.weather[0].description,
      iconCode: current.weather[0].icon,
      minTemp: Math.round(todaysForecast.temp.min),
      maxTemp: Math.round(todaysForecast.temp.max),
      windSpeed: Math.round(current.wind_speed),
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][
        Math.round(current.wind_deg / 45) % 8
      ],
      windGust:
        current.wind_gust !== undefined
          ? Math.round(current.wind_gust)
          : undefined,
    }

    // Process forecast (next 3 days, skipping today)
    const forecast = data.daily.slice(1, REQUIRED_FORECAST_DAYS).map(day => {
      const date = new Date(day.dt * 1000)
      return {
        dayName: date.toLocaleDateString(undefined, { weekday: 'short' }),
        iconCode: day.weather[0].icon,
        description: day.weather[0].description,
        maxTemp: Math.round(day.temp.max),
        minTemp: Math.round(day.temp.min),
        date,
      }
    })

    // Process astronomy data
    const astronomy = {
      sunrise: current.sunrise,
      sunset: current.sunset,
      moonPhase: todaysForecast.moon_phase,
    }

    return {
      current: currentWeather,
      forecast,
      astronomy,
    }
  }

  /**
   * Maps OpenWeatherMap icon codes to local SVG file names
   * @param owmCode OpenWeatherMap icon code (e.g., '01d', '02n')
   * @returns string Local SVG filename without extension
   */
  mapIconCodeToSVG(owmCode: string): string {
    return mapOWMIconToSVG(owmCode)
  }
}
