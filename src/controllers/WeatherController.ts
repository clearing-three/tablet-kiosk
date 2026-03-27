/**
 * Weather Controller
 *
 * Manages the weather data update lifecycle.
 * Owns the update interval and coordinates weather-related views.
 */

import type { SunView } from '../components/Astronomy/SunView'
import type { ErrorDisplay } from '../components/ErrorDisplay'
import type { CurrentConditionsView } from '../components/Weather/CurrentConditionsView'
import type { ForecastView } from '../components/Weather/ForecastView'
import type { WeatherService } from '../services/WeatherService'
import { UpdateScheduler } from '../core/UpdateScheduler'

export class WeatherController {
  private scheduler: UpdateScheduler

  constructor(
    private weatherView: CurrentConditionsView,
    private forecastView: ForecastView,
    private sunView: SunView,
    private weatherService: WeatherService,
    private errorDisplay: ErrorDisplay,
    updateIntervalMs: number,
  ) {
    this.scheduler = new UpdateScheduler(updateIntervalMs)
  }

  start(): void {
    this.scheduler.start(() => {
      this.update()
    })
  }

  async update(): Promise<void> {
    try {
      const weatherData = await this.weatherService.getWeatherData()

      this.weatherView.render(weatherData.current)
      this.forecastView.render(weatherData.forecast)
      this.sunView.render(weatherData.astronomy)

      this.errorDisplay.remove('weather-update')
    }
    catch (error) {
      console.error('Failed to update weather data:', error)
      this.errorDisplay.show('weather-update', error)
    }
  }

  stop(): void {
    this.scheduler.stop()
  }

  destroy(): void {
    this.stop()
  }
}
