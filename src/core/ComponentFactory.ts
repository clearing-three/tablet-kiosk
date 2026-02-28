import { WeatherService } from '../services/WeatherService'
import { MoonPhaseService } from '../services/MoonPhaseService'
import { WeatherDisplay } from '../components/Weather/WeatherDisplay'
import { WeatherForecast } from '../components/Weather/WeatherForecast'
import { AstronomyTimes } from '../components/Astronomy/AstronomyTimes'
import { MoonPhase } from '../components/Astronomy/MoonPhase'
import { TimeDisplay } from '../components/Time/TimeDisplay'

export class ComponentFactory {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly moonPhaseService: MoonPhaseService
  ) {}

  createWeatherDisplay(): WeatherDisplay {
    return new WeatherDisplay(this.weatherService)
  }

  createWeatherForecast(): WeatherForecast {
    return new WeatherForecast(this.weatherService)
  }

  createAstronomyTimes(): AstronomyTimes {
    return new AstronomyTimes()
  }

  createMoonPhase(): MoonPhase {
    return new MoonPhase(this.moonPhaseService)
  }

  createTimeDisplay(): TimeDisplay {
    return new TimeDisplay()
  }
}
