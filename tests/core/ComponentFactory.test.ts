import { ComponentFactory } from '../../src/core/ComponentFactory'
import { WeatherDisplay } from '../../src/components/Weather/WeatherDisplay'
import { WeatherForecast } from '../../src/components/Weather/WeatherForecast'
import { AstronomyTimes } from '../../src/components/Astronomy/AstronomyTimes'
import { MoonPhase } from '../../src/components/Astronomy/MoonPhase'
import { TimeDisplay } from '../../src/components/Time/TimeDisplay'
import type { WeatherService } from '../../src/services/WeatherService'
import type { MoonPhaseService } from '../../src/services/MoonPhaseService'

describe('ComponentFactory', () => {
  let factory: ComponentFactory
  let mockWeatherService: WeatherService
  let mockMoonPhaseService: MoonPhaseService

  beforeEach(() => {
    document.body.innerHTML = `
      <object id="weather-icon"></object>
      <div id="temp-now"></div>
      <div id="feels-like"></div>
      <div id="weather-desc"></div>
      <div id="weather-range"></div>
      <div id="forecast"></div>
      <div id="sunrise-time"></div>
      <div id="sunset-time"></div>
      <div id="moonrise-time"></div>
      <div id="moonset-time"></div>
      <div id="moon"></div>
      <div id="moon-phase-name"></div>
      <div id="time"></div>
      <div id="date"></div>
    `

    mockWeatherService = {} as WeatherService
    mockMoonPhaseService = {} as MoonPhaseService
    factory = new ComponentFactory(mockWeatherService, mockMoonPhaseService)
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

  describe('createMoonPhase()', () => {
    it('returns a MoonPhase instance', () => {
      expect(factory.createMoonPhase()).toBeInstanceOf(MoonPhase)
    })

    it('returns a new instance on each call', () => {
      expect(factory.createMoonPhase()).not.toBe(factory.createMoonPhase())
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
