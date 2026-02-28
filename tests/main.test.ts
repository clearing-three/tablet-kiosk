import { TabletKioskApp } from '../src/main'
import { DEFAULT_APP_CONFIG } from '../src/types/app.types'
import { DOM_IDS } from '../src/utils/constants'
import type { DOMValidator } from '../src/core/DOMValidator'
import type { AssetValidator } from '../src/core/AssetValidator'
import type { ComponentFactory } from '../src/core/ComponentFactory'
import type { WeatherService } from '../src/services/WeatherService'
import type { ErrorDisplay } from '../src/components/ErrorDisplay'
import type { ProcessedWeatherData } from '../src/types/weather.types'

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

describe('TabletKioskApp', () => {
  let mockWeatherDisplay: { updateDisplay: ReturnType<typeof vi.fn> }
  let mockWeatherForecast: { updateForecast: ReturnType<typeof vi.fn> }
  let mockAstronomyTimes: { updateTimes: ReturnType<typeof vi.fn> }
  let mockMoonPhase: { updatePhase: ReturnType<typeof vi.fn> }
  let mockTimeDisplay: {
    startUpdates: ReturnType<typeof vi.fn>
    updateDisplay: ReturnType<typeof vi.fn>
    destroy: ReturnType<typeof vi.fn>
  }

  let mockDomValidator: Pick<DOMValidator, 'validate'>
  let mockAssetValidator: Pick<AssetValidator, 'validateAll'>
  let mockComponentFactory: Pick<
    ComponentFactory,
    | 'createWeatherDisplay'
    | 'createWeatherForecast'
    | 'createAstronomyTimes'
    | 'createMoonPhase'
    | 'createTimeDisplay'
  >
  let mockWeatherService: Pick<WeatherService, 'getProcessedWeatherData'>
  let mockErrorDisplay: Pick<ErrorDisplay, 'show' | 'remove'>

  function makeApp(): TabletKioskApp {
    return new TabletKioskApp(
      DEFAULT_APP_CONFIG,
      mockDomValidator as DOMValidator,
      mockAssetValidator as AssetValidator,
      mockComponentFactory as ComponentFactory,
      mockWeatherService as WeatherService,
      mockErrorDisplay as ErrorDisplay
    )
  }

  beforeEach(() => {
    vi.useFakeTimers()

    mockWeatherDisplay = { updateDisplay: vi.fn() }
    mockWeatherForecast = { updateForecast: vi.fn() }
    mockAstronomyTimes = { updateTimes: vi.fn() }
    mockMoonPhase = { updatePhase: vi.fn() }
    mockTimeDisplay = {
      startUpdates: vi.fn(),
      updateDisplay: vi.fn(),
      destroy: vi.fn(),
    }

    mockDomValidator = {
      validate: vi.fn().mockReturnValue({ valid: true, missing: [] }),
    }
    mockAssetValidator = {
      validateAll: vi.fn().mockResolvedValue({ valid: true, missing: [] }),
    }
    mockComponentFactory = {
      createWeatherDisplay: vi.fn().mockReturnValue(mockWeatherDisplay),
      createWeatherForecast: vi.fn().mockReturnValue(mockWeatherForecast),
      createAstronomyTimes: vi.fn().mockReturnValue(mockAstronomyTimes),
      createMoonPhase: vi.fn().mockReturnValue(mockMoonPhase),
      createTimeDisplay: vi.fn().mockReturnValue(mockTimeDisplay),
    }
    mockWeatherService = {
      getProcessedWeatherData: vi.fn().mockResolvedValue(mockWeatherData),
    }
    mockErrorDisplay = { show: vi.fn(), remove: vi.fn() }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('constructor', () => {
    it('creates all components via the factory', () => {
      makeApp()

      expect(mockComponentFactory.createWeatherDisplay).toHaveBeenCalledTimes(1)
      expect(mockComponentFactory.createWeatherForecast).toHaveBeenCalledTimes(
        1
      )
      expect(mockComponentFactory.createAstronomyTimes).toHaveBeenCalledTimes(1)
      expect(mockComponentFactory.createMoonPhase).toHaveBeenCalledTimes(1)
      expect(mockComponentFactory.createTimeDisplay).toHaveBeenCalledTimes(1)
    })
  })

  describe('initialize()', () => {
    it('validates DOM elements', async () => {
      await makeApp().initialize()

      expect(mockDomValidator.validate).toHaveBeenCalledOnce()
    })

    it('passes all DOM_IDS values to the validator', async () => {
      await makeApp().initialize()

      expect(mockDomValidator.validate).toHaveBeenCalledWith(
        Object.values(DOM_IDS)
      )
    })

    it('throws with missing element names when DOM is invalid', async () => {
      mockDomValidator.validate = vi
        .fn()
        .mockReturnValue({ valid: false, missing: ['time', 'date'] })

      await expect(makeApp().initialize()).rejects.toThrow(
        'Missing DOM elements: time, date'
      )
    })

    it('starts time display updates', async () => {
      await makeApp().initialize()

      expect(mockTimeDisplay.startUpdates).toHaveBeenCalledOnce()
    })

    it('triggers an initial weather update', async () => {
      await makeApp().initialize()

      expect(mockWeatherService.getProcessedWeatherData).toHaveBeenCalledOnce()
    })
  })

  describe('destroy()', () => {
    it('stops scheduled weather updates', async () => {
      const app = makeApp()
      await app.initialize()

      app.destroy()
      vi.advanceTimersByTime(DEFAULT_APP_CONFIG.weatherUpdateIntervalMs)

      // Only the initial call from initialize() — no interval calls after destroy
      expect(mockWeatherService.getProcessedWeatherData).toHaveBeenCalledTimes(
        1
      )
    })

    it('destroys the time display', () => {
      makeApp().destroy()

      expect(mockTimeDisplay.destroy).toHaveBeenCalledOnce()
    })
  })

  describe('refresh()', () => {
    it('triggers a weather update', async () => {
      await makeApp().refresh()

      expect(mockWeatherService.getProcessedWeatherData).toHaveBeenCalledOnce()
    })

    it('updates the time display', async () => {
      await makeApp().refresh()

      expect(mockTimeDisplay.updateDisplay).toHaveBeenCalledOnce()
    })
  })
})
