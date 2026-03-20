import { WeatherService } from '../services/WeatherService'
import { WeatherDisplay } from '../components/Weather/WeatherDisplay'
import { WeatherForecast } from '../components/Weather/WeatherForecast'
import { AstronomyTimes } from '../components/Astronomy/AstronomyTimes'
import { ErrorDisplay } from '../components/ErrorDisplay'

export class WeatherUpdateCoordinator {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly weatherDisplay: WeatherDisplay,
    private readonly weatherForecast: WeatherForecast,
    private readonly astronomyTimes: AstronomyTimes,
    private readonly errorDisplay: ErrorDisplay
  ) {}

  async update(): Promise<void> {
    try {
      const weatherData = await this.weatherService.getWeatherData()

      this.weatherDisplay.updateDisplay(weatherData.current)
      this.weatherForecast.updateForecast(weatherData.forecast)
      this.astronomyTimes.updateTimes(weatherData.astronomy)

      this.errorDisplay.remove('weather-update')
    } catch (error) {
      console.error('Failed to update weather data:', error)
      this.errorDisplay.show('weather-update', error)
    }
  }
}
