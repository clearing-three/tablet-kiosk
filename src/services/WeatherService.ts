/**
 * Weather Service
 *
 * Orchestrates weather data fetching and processing.
 * Provides a simplified interface for weather operations.
 */

import { OpenWeatherApiClient } from './OpenWeatherApiClient'
import { WeatherDataProcessor } from './WeatherDataProcessor'
import type { WeatherData } from '../types/weather-domain.types'
import type { WeatherServiceConfig } from '../types/service-config.types'

export class WeatherService {
  private readonly client: OpenWeatherApiClient
  private readonly processor: WeatherDataProcessor

  constructor(config: WeatherServiceConfig) {
    this.client = new OpenWeatherApiClient(config)
    this.processor = new WeatherDataProcessor()
  }

  /**
   * Fetches and processes weather data in one call
   * @returns Promise<WeatherData> Processed weather data ready for display
   */
  async getWeatherData(): Promise<WeatherData> {
    const rawData = await this.client.fetchWeatherData()
    return this.processor.processWeatherData(rawData)
  }

  /**
   * Maps OpenWeatherMap icon codes to local SVG file names
   * @param owmCode OpenWeatherMap icon code (e.g., '01d', '02n')
   * @returns string Local SVG filename without extension
   */
  mapIconCodeToSVG(owmCode: string): string {
    return this.processor.mapIconCodeToSVG(owmCode)
  }

  /**
   * Gets the current configuration
   * @returns WeatherServiceConfig Current service configuration
   */
  getConfig(): WeatherServiceConfig {
    return this.client.getConfig()
  }
}
