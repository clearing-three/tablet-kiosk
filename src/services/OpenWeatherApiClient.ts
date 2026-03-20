/**
 * OpenWeather API Client
 *
 * Handles OpenWeatherMap One Call 3.0 API interactions.
 * Provides type-safe weather data fetching and error handling.
 */

import {
  WeatherApiDataSchema,
  type WeatherApiData,
  type WeatherApiError,
} from '../types/weather-api.types'
import type { WeatherServiceConfig } from '../types/service-config.types'

export class OpenWeatherApiClient {
  static readonly Errors = {
    networkError: 'Network error: Unable to connect to weather service',
    apiError: (cod: string | number, message: string) =>
      `API Error ${cod}: ${message}`,
    httpError: (status: number, statusText: string) =>
      `HTTP ${status}: ${statusText}`,
  } as const

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
   * @returns Promise<WeatherApiData> Raw API response data
   * @throws Error if API call fails or returns invalid data
   */
  async fetchWeatherData(): Promise<WeatherApiData> {
    const url = this.buildApiUrl()

    try {
      const response = await fetch(url)

      if (!response.ok) {
        let errorMessage: string
        try {
          const errorData: WeatherApiError = await response.json()
          errorMessage = OpenWeatherApiClient.Errors.apiError(
            errorData.cod,
            errorData.message
          )
        } catch {
          errorMessage = OpenWeatherApiClient.Errors.httpError(
            response.status,
            response.statusText
          )
        }
        throw new Error(errorMessage)
      }

      const rawData = await response.json()
      const data = WeatherApiDataSchema.parse(rawData)

      return data
    } catch (error) {
      if (
        error instanceof TypeError &&
        (error.message.includes('fetch') ||
          error.message.includes('Network request'))
      ) {
        throw new Error(OpenWeatherApiClient.Errors.networkError, {
          cause: error,
        })
      }
      throw error
    }
  }

  /**
   * Gets the current configuration
   * @returns WeatherServiceConfig Current client configuration
   */
  getConfig(): WeatherServiceConfig {
    return { ...this.config }
  }
}
