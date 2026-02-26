/**
 * Weather Service
 *
 * Service class for handling OpenWeatherMap One Call 3.0 API interactions.
 * Provides type-safe weather data fetching, error handling, and data processing.
 */

import type {
  WeatherData,
  ProcessedWeatherData,
  WeatherApiError,
} from '../types/weather.types'
import type { WeatherServiceConfig } from '../types/service-config.types'
import { mapOWMIconToSVG } from '../utils/iconMapper'
import { REQUIRED_FORECAST_DAYS } from '../constants/weather.constants'

export class WeatherService {
  private readonly config: WeatherServiceConfig
  private readonly baseUrl = 'https://api.openweathermap.org/data/3.0/onecall'

  constructor(config: WeatherServiceConfig) {
    this.config = config
  }

  /**
   * Constructs the API URL with all required parameters
   */
  private buildApiUrl(): string {
    const params = new globalThis.URLSearchParams({
      lat: this.config.latitude,
      lon: this.config.longitude,
      units: this.config.units,
      exclude: 'minutely,hourly,alerts',
      appid: this.config.apiKey,
    })

    if (this.config.language) {
      params.append('lang', this.config.language)
    }

    return `${this.baseUrl}?${params.toString()}`
  }

  /**
   * Fetches raw weather data from OpenWeatherMap API
   * @returns Promise<WeatherData> Raw API response data
   * @throws Error if API call fails or returns invalid data
   */
  async fetchWeatherData(): Promise<WeatherData> {
    const url = this.buildApiUrl()

    try {
      const response = await fetch(url)

      if (!response.ok) {
        // Try to parse error response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorData: WeatherApiError = await response.json()
          errorMessage = `API Error ${errorData.cod}: ${errorData.message}`
        } catch {
          // Use the HTTP error message if JSON parsing fails
        }
        throw new Error(errorMessage)
      }

      const data: WeatherData = await response.json()

      // Basic validation of response structure
      if (!data.current || !data.daily || !Array.isArray(data.daily)) {
        throw new Error('Invalid API response: missing required data fields')
      }

      if (data.daily.length === 0) {
        throw new Error('Invalid API response: no daily forecast data')
      }

      if (data.daily.length < REQUIRED_FORECAST_DAYS) {
        throw new Error(
          `Invalid API response: insufficient forecast data. Expected at least ${REQUIRED_FORECAST_DAYS} days, got ${data.daily.length} days`
        )
      }

      return data
    } catch (error) {
      if (
        error instanceof TypeError &&
        (error.message.includes('fetch') ||
          error.message.includes('Network request'))
      ) {
        throw new Error('Network error: Unable to connect to weather service', {
          cause: error,
        })
      }
      throw error
    }
  }

  /**
   * Processes raw weather data into format suitable for UI components
   * @param data Raw weather data from API
   * @returns ProcessedWeatherData Processed data ready for display
   */
  processWeatherData(data: WeatherData): ProcessedWeatherData {
    // Validate that we have sufficient forecast data
    if (!data.daily || !Array.isArray(data.daily)) {
      throw new Error('Invalid weather data: missing daily forecast array')
    }

    if (data.daily.length < REQUIRED_FORECAST_DAYS) {
      throw new Error(
        `Invalid weather data: insufficient forecast data. Expected at least ${REQUIRED_FORECAST_DAYS} days, got ${data.daily.length} days`
      )
    }

    const current = data.current
    const todaysForecast = data.daily[0]

    // Process current weather
    const currentWeather = {
      temperature: Math.round(current.temp),
      description: current.weather[0].description,
      iconCode: current.weather[0].icon,
      minTemp: Math.round(todaysForecast.temp.min),
      maxTemp: Math.round(todaysForecast.temp.max),
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
      moonrise: todaysForecast.moonrise,
      moonset: todaysForecast.moonset,
      moonPhase: todaysForecast.moon_phase,
    }

    return {
      current: currentWeather,
      forecast,
      astronomy,
    }
  }

  /**
   * Fetches and processes weather data in one call
   * @returns Promise<ProcessedWeatherData> Processed weather data ready for display
   */
  async getProcessedWeatherData(): Promise<ProcessedWeatherData> {
    const rawData = await this.fetchWeatherData()
    return this.processWeatherData(rawData)
  }

  /**
   * Maps OpenWeatherMap icon codes to local SVG file names
   * @param owmCode OpenWeatherMap icon code (e.g., '01d', '02n')
   * @returns string Local SVG filename without extension
   */
  mapIconCodeToSVG(owmCode: string): string {
    return mapOWMIconToSVG(owmCode)
  }

  /**
   * Gets the current configuration
   * @returns WeatherServiceConfig Current service configuration
   */
  getConfig(): WeatherServiceConfig {
    return { ...this.config }
  }
}
