import { ComponentFactory } from '../../src/core/ComponentFactory'
import { WeatherDisplay } from '../../src/components/Weather/WeatherDisplay'
import { WeatherForecast } from '../../src/components/Weather/WeatherForecast'
import { AstronomyTimes } from '../../src/components/Astronomy/AstronomyTimes'
import { TimeDisplay } from '../../src/components/Time/TimeDisplay'

describe('ComponentFactory', () => {
  let factory: ComponentFactory

  beforeEach(() => {
    document.body.innerHTML = `
      <object id="weather-icon"></object>
      <div id="temp-now"></div>
      <div id="feels-like"></div>
      <span id="wind-direction"></span>
      <span id="wind-speed"></span>
      <div id="weather-desc"></div>
      <div id="weather-range"></div>
      <div id="forecast">
        <div id="forecast-day-1" class="forecast-day">
          <div class="forecast-day-name"></div>
          <object type="image/svg+xml" class="forecast-icon"></object>
          <div class="forecast-desc"></div>
          <div class="forecast-range"></div>
        </div>
        <div id="forecast-day-2" class="forecast-day">
          <div class="forecast-day-name"></div>
          <object type="image/svg+xml" class="forecast-icon"></object>
          <div class="forecast-desc"></div>
          <div class="forecast-range"></div>
        </div>
      </div>
      <div id="sunrise-time"></div>
      <div id="sunset-time"></div>
      <div id="moon"></div>
      <div id="time"></div>
      <div id="date"></div>
    `

    factory = new ComponentFactory()
  })

  describe('createWeatherDisplay()', () => {
    it('returns a WeatherDisplay instance', () => {
      expect(factory.createWeatherDisplay()).toBeInstanceOf(WeatherDisplay)
    })

    it('returns a new instance on each call', () => {
      expect(factory.createWeatherDisplay()).not.toBe(
        factory.createWeatherDisplay()
      )
    })
  })

  describe('createWeatherForecast()', () => {
    it('returns a WeatherForecast instance', () => {
      expect(factory.createWeatherForecast()).toBeInstanceOf(WeatherForecast)
    })

    it('returns a new instance on each call', () => {
      expect(factory.createWeatherForecast()).not.toBe(
        factory.createWeatherForecast()
      )
    })
  })

  describe('createAstronomyTimes()', () => {
    it('returns an AstronomyTimes instance', () => {
      expect(factory.createAstronomyTimes()).toBeInstanceOf(AstronomyTimes)
    })

    it('returns a new instance on each call', () => {
      expect(factory.createAstronomyTimes()).not.toBe(
        factory.createAstronomyTimes()
      )
    })
  })

  describe('createTimeDisplay()', () => {
    it('returns a TimeDisplay instance', () => {
      expect(factory.createTimeDisplay()).toBeInstanceOf(TimeDisplay)
    })

    it('returns a new instance on each call', () => {
      expect(factory.createTimeDisplay()).not.toBe(factory.createTimeDisplay())
    })
  })
})
