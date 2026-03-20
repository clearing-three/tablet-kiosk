import { WeatherDisplay } from '../components/Weather/WeatherDisplay'
import { WeatherForecast } from '../components/Weather/WeatherForecast'
import { AstronomyTimes } from '../components/Astronomy/AstronomyTimes'
import { TimeDisplay } from '../components/Time/TimeDisplay'

export class ComponentFactory {
  createWeatherDisplay(): WeatherDisplay {
    return new WeatherDisplay()
  }

  createWeatherForecast(): WeatherForecast {
    return new WeatherForecast()
  }

  createAstronomyTimes(): AstronomyTimes {
    return new AstronomyTimes()
  }

  createTimeDisplay(): TimeDisplay {
    return new TimeDisplay()
  }
}
