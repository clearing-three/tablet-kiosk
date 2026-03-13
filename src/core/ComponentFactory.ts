import { WeatherService } from '../services/WeatherService'
import { WeatherDisplay } from '../components/Weather/WeatherDisplay'
import { WeatherForecast } from '../components/Weather/WeatherForecast'
import { AstronomyTimes } from '../components/Astronomy/AstronomyTimes'
import { TimeDisplay } from '../components/Time/TimeDisplay'

export class ComponentFactory {
  constructor(private readonly weatherService: WeatherService) {}

  createWeatherDisplay(): WeatherDisplay {
    return new WeatherDisplay(this.weatherService)
  }

  createWeatherForecast(): WeatherForecast {
    return new WeatherForecast(this.weatherService)
  }

  createAstronomyTimes(): AstronomyTimes {
    return new AstronomyTimes()
  }

  createTimeDisplay(): TimeDisplay {
    return new TimeDisplay()
  }
}
