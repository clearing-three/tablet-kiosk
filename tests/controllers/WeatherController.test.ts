import { WeatherController } from '../../src/controllers/WeatherController'
import type { WeatherService } from '../../src/services/WeatherService'
import type { WeatherView } from '../../src/components/Weather/WeatherView'
import type { ForecastView } from '../../src/components/Weather/ForecastView'
import type { AstronomyView } from '../../src/components/Astronomy/AstronomyView'
import type { ErrorDisplay } from '../../src/components/ErrorDisplay'
import type { WeatherData } from '../../src/types/weather-domain.types'

const mockWeatherData: WeatherData = {
  current: {
    temperature: 72,
    feelsLike: 70,
    description: 'clear sky',
    icon: 'clear-day',
    minTemp: 65,
    maxTemp: 78,
    windSpeed: 5,
    windDirection: 'SW',
  },
  forecast: [
    {
      dayName: 'Mon',
      icon: 'clear-day',
      description: 'clear sky',
      maxTemp: 78,
      minTemp: 65,
      date: new Date('2026-02-27'),
    },
  ],
  astronomy: {
    sunrise: 1640966400,
    sunset: 1641002400,
    moonPhase: 0.25,
  },
}

describe('WeatherController', () => {
  let mockWeatherService: Pick<WeatherService, 'getWeatherData'>
  let mockWeatherView: Pick<WeatherView, 'render'>
  let mockForecastView: Pick<ForecastView, 'render'>
  let mockAstronomyView: Pick<AstronomyView, 'render'>
  let mockErrorDisplay: Pick<ErrorDisplay, 'show' | 'remove'>
  let controller: WeatherController

  beforeEach(() => {
    mockWeatherService = {
      getWeatherData: vi.fn().mockResolvedValue(mockWeatherData),
    }
    mockWeatherView = { render: vi.fn() }
    mockForecastView = { render: vi.fn() }
    mockAstronomyView = { render: vi.fn() }
    mockErrorDisplay = { show: vi.fn(), remove: vi.fn() }

    controller = new WeatherController(
      mockWeatherView as WeatherView,
      mockForecastView as ForecastView,
      mockAstronomyView as AstronomyView,
      mockWeatherService as WeatherService,
      mockErrorDisplay as ErrorDisplay,
      10000 // 10s interval for testing
    )
  })

  describe('update() — success', () => {
    it('calls getWeatherData on the weather service', async () => {
      await controller.update()

      expect(mockWeatherService.getWeatherData).toHaveBeenCalledTimes(1)
    })

    it('passes current weather to weatherView.render', async () => {
      await controller.update()

      expect(mockWeatherView.render).toHaveBeenCalledWith(
        mockWeatherData.current
      )
    })

    it('passes forecast to forecastView.render', async () => {
      await controller.update()

      expect(mockForecastView.render).toHaveBeenCalledWith(
        mockWeatherData.forecast
      )
    })

    it('passes astronomy to astronomyView.render', async () => {
      await controller.update()

      expect(mockAstronomyView.render).toHaveBeenCalledWith(
        mockWeatherData.astronomy
      )
    })

    it('removes the weather-update error on success', async () => {
      await controller.update()

      expect(mockErrorDisplay.remove).toHaveBeenCalledWith('weather-update')
    })

    it('does not call errorDisplay.show on success', async () => {
      await controller.update()

      expect(mockErrorDisplay.show).not.toHaveBeenCalled()
    })
  })

  describe('update() — failure', () => {
    const fetchError = new Error('network failure')

    beforeEach(() => {
      mockWeatherService.getWeatherData = vi.fn().mockRejectedValue(fetchError)
    })

    it('calls errorDisplay.show with the weather-update key', async () => {
      await controller.update()

      expect(mockErrorDisplay.show).toHaveBeenCalledWith(
        'weather-update',
        fetchError
      )
    })

    it('does not call any view render methods', async () => {
      await controller.update()

      expect(mockWeatherView.render).not.toHaveBeenCalled()
      expect(mockForecastView.render).not.toHaveBeenCalled()
      expect(mockAstronomyView.render).not.toHaveBeenCalled()
    })

    it('does not call errorDisplay.remove on failure', async () => {
      await controller.update()

      expect(mockErrorDisplay.remove).not.toHaveBeenCalled()
    })
  })

  describe('lifecycle methods', () => {
    it('should start without errors', () => {
      expect(() => controller.start()).not.toThrow()
    })

    it('should stop without errors', () => {
      controller.start()
      expect(() => controller.stop()).not.toThrow()
    })

    it('should destroy without errors', () => {
      controller.start()
      expect(() => controller.destroy()).not.toThrow()
    })
  })
})
