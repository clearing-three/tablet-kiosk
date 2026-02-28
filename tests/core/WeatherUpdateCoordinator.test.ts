import { WeatherUpdateCoordinator } from '../../src/core/WeatherUpdateCoordinator'
import type { WeatherService } from '../../src/services/WeatherService'
import type { WeatherDisplay } from '../../src/components/Weather/WeatherDisplay'
import type { WeatherForecast } from '../../src/components/Weather/WeatherForecast'
import type { AstronomyTimes } from '../../src/components/Astronomy/AstronomyTimes'
import type { MoonPhase } from '../../src/components/Astronomy/MoonPhase'
import type { ErrorDisplay } from '../../src/components/ErrorDisplay'
import type { ProcessedWeatherData } from '../../src/types/weather.types'

const mockWeatherData: ProcessedWeatherData = {
  current: {
    temperature: 72,
    description: 'clear sky',
    iconCode: '01d',
    minTemp: 65,
    maxTemp: 78,
  },
  forecast: [
    {
      dayName: 'Mon',
      iconCode: '01d',
      description: 'clear sky',
      maxTemp: 78,
      minTemp: 65,
      date: new Date('2026-02-27'),
    },
  ],
  astronomy: {
    sunrise: 1640966400,
    sunset: 1641002400,
    moonrise: 1640980800,
    moonset: 1641024000,
    moonPhase: 0.25,
  },
}

describe('WeatherUpdateCoordinator', () => {
  let mockWeatherService: Pick<WeatherService, 'getProcessedWeatherData'>
  let mockWeatherDisplay: Pick<WeatherDisplay, 'updateDisplay'>
  let mockWeatherForecast: Pick<WeatherForecast, 'updateForecast'>
  let mockAstronomyTimes: Pick<AstronomyTimes, 'updateTimes'>
  let mockMoonPhase: Pick<MoonPhase, 'updatePhase'>
  let mockErrorDisplay: Pick<ErrorDisplay, 'show' | 'remove'>
  let coordinator: WeatherUpdateCoordinator

  beforeEach(() => {
    mockWeatherService = {
      getProcessedWeatherData: vi.fn().mockResolvedValue(mockWeatherData),
    }
    mockWeatherDisplay = { updateDisplay: vi.fn() }
    mockWeatherForecast = { updateForecast: vi.fn() }
    mockAstronomyTimes = { updateTimes: vi.fn() }
    mockMoonPhase = { updatePhase: vi.fn() }
    mockErrorDisplay = { show: vi.fn(), remove: vi.fn() }

    coordinator = new WeatherUpdateCoordinator(
      mockWeatherService as WeatherService,
      mockWeatherDisplay as WeatherDisplay,
      mockWeatherForecast as WeatherForecast,
      mockAstronomyTimes as AstronomyTimes,
      mockMoonPhase as MoonPhase,
      mockErrorDisplay as ErrorDisplay
    )
  })

  describe('update() — success', () => {
    it('calls getProcessedWeatherData on the weather service', async () => {
      await coordinator.update()

      expect(mockWeatherService.getProcessedWeatherData).toHaveBeenCalledTimes(
        1
      )
    })

    it('passes current weather to weatherDisplay.updateDisplay', async () => {
      await coordinator.update()

      expect(mockWeatherDisplay.updateDisplay).toHaveBeenCalledWith(
        mockWeatherData.current
      )
    })

    it('passes forecast to weatherForecast.updateForecast', async () => {
      await coordinator.update()

      expect(mockWeatherForecast.updateForecast).toHaveBeenCalledWith(
        mockWeatherData.forecast
      )
    })

    it('passes astronomy to astronomyTimes.updateTimes', async () => {
      await coordinator.update()

      expect(mockAstronomyTimes.updateTimes).toHaveBeenCalledWith(
        mockWeatherData.astronomy
      )
    })

    it('passes moonPhase to moonPhase.updatePhase', async () => {
      await coordinator.update()

      expect(mockMoonPhase.updatePhase).toHaveBeenCalledWith(
        mockWeatherData.astronomy.moonPhase
      )
    })

    it('removes the weather-update error on success', async () => {
      await coordinator.update()

      expect(mockErrorDisplay.remove).toHaveBeenCalledWith('weather-update')
    })

    it('does not call errorDisplay.show on success', async () => {
      await coordinator.update()

      expect(mockErrorDisplay.show).not.toHaveBeenCalled()
    })
  })

  describe('update() — failure', () => {
    const fetchError = new Error('network failure')

    beforeEach(() => {
      mockWeatherService.getProcessedWeatherData = vi
        .fn()
        .mockRejectedValue(fetchError)
    })

    it('calls errorDisplay.show with the weather-update key', async () => {
      await expect(coordinator.update()).rejects.toThrow()

      expect(mockErrorDisplay.show).toHaveBeenCalledWith(
        'weather-update',
        fetchError
      )
    })

    it('re-throws the error', async () => {
      await expect(coordinator.update()).rejects.toThrow('network failure')
    })

    it('does not call any display update methods', async () => {
      await expect(coordinator.update()).rejects.toThrow()

      expect(mockWeatherDisplay.updateDisplay).not.toHaveBeenCalled()
      expect(mockWeatherForecast.updateForecast).not.toHaveBeenCalled()
      expect(mockAstronomyTimes.updateTimes).not.toHaveBeenCalled()
      expect(mockMoonPhase.updatePhase).not.toHaveBeenCalled()
    })

    it('does not call errorDisplay.remove on failure', async () => {
      await expect(coordinator.update()).rejects.toThrow()

      expect(mockErrorDisplay.remove).not.toHaveBeenCalled()
    })
  })
})
