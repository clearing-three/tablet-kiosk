import type { Mock } from 'vitest'
import { TabletKioskApp } from '../src/main'
import { DOM_IDS } from '../src/utils/constants'
import type { DOMValidator } from '../src/core/DOMValidator'
import type { AssetValidator } from '../src/core/AssetValidator'
import type { UpdateScheduler } from '../src/core/UpdateScheduler'
import type { WeatherUpdateCoordinator } from '../src/core/WeatherUpdateCoordinator'
import type { TimeDisplay } from '../src/components/Time/TimeDisplay'
import type { NasaMoonDisplay } from '../src/components/Astronomy/NasaMoonDisplay'
import type { ErrorDisplay } from '../src/components/ErrorDisplay'

describe('TabletKioskApp', () => {
  let mockDomValidator: Pick<DOMValidator, 'validate'>
  let mockAssetValidator: Pick<AssetValidator, 'validateAll'>
  let mockWeatherCoordinator: Pick<WeatherUpdateCoordinator, 'update'>
  let mockWeatherScheduler: Pick<UpdateScheduler, 'start' | 'stop'>
  let mockTimeDisplay: Pick<
    TimeDisplay,
    'startUpdates' | 'updateDisplay' | 'destroy'
  >
  let mockNasaMoonDisplay: Pick<NasaMoonDisplay, 'startUpdates' | 'destroy'>
  let mockErrorDisplay: Pick<ErrorDisplay, 'show' | 'remove'>

  function makeApp(): TabletKioskApp {
    return new TabletKioskApp(
      mockDomValidator as DOMValidator,
      mockAssetValidator as AssetValidator,
      mockWeatherCoordinator as WeatherUpdateCoordinator,
      mockWeatherScheduler as UpdateScheduler,
      mockTimeDisplay as TimeDisplay,
      mockNasaMoonDisplay as NasaMoonDisplay,
      mockErrorDisplay as ErrorDisplay
    )
  }

  beforeEach(() => {
    mockDomValidator = {
      validate: vi.fn().mockReturnValue({ valid: true, missing: [] }),
    }
    mockAssetValidator = {
      validateAll: vi.fn().mockResolvedValue({ valid: true, missing: [] }),
    }
    mockWeatherCoordinator = {
      update: vi.fn().mockResolvedValue(undefined),
    }
    mockWeatherScheduler = {
      start: vi.fn(),
      stop: vi.fn(),
    }
    mockTimeDisplay = {
      startUpdates: vi.fn(),
      updateDisplay: vi.fn(),
      destroy: vi.fn(),
    }
    mockNasaMoonDisplay = {
      startUpdates: vi.fn(),
      destroy: vi.fn(),
    }
    mockErrorDisplay = {
      show: vi.fn(),
      remove: vi.fn(),
    }
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

    it('starts NASA moon updates', async () => {
      await makeApp().initialize()

      expect(mockNasaMoonDisplay.startUpdates).toHaveBeenCalledOnce()
    })

    it('starts the weather scheduler', async () => {
      await makeApp().initialize()

      expect(mockWeatherScheduler.start).toHaveBeenCalledOnce()
    })

    it('wires onError to show a clock-update error bar', async () => {
      await makeApp().initialize()

      const [onError] = (mockTimeDisplay.startUpdates as Mock).mock
        .calls[0] as [(error: unknown) => void]
      const err = new Error('clock error')
      onError(err)

      expect(mockErrorDisplay.show).toHaveBeenCalledWith('clock-update', err)
    })

    it('wires onSuccess to remove the clock-update error bar', async () => {
      await makeApp().initialize()

      const [, onSuccess] = (mockTimeDisplay.startUpdates as Mock).mock
        .calls[0] as [unknown, () => void]
      onSuccess()

      expect(mockErrorDisplay.remove).toHaveBeenCalledWith('clock-update')
    })

    it('wires onError to show a nasa-moon error bar', async () => {
      await makeApp().initialize()

      const [onError] = (mockNasaMoonDisplay.startUpdates as Mock).mock
        .calls[0] as [(error: unknown) => void]
      const err = new Error('NASA API error')
      onError(err)

      expect(mockErrorDisplay.show).toHaveBeenCalledWith('nasa-moon', err)
    })

    it('wires onSuccess to remove the nasa-moon error bar', async () => {
      await makeApp().initialize()

      const [, onSuccess] = (mockNasaMoonDisplay.startUpdates as Mock).mock
        .calls[0] as [unknown, () => void]
      onSuccess()

      expect(mockErrorDisplay.remove).toHaveBeenCalledWith('nasa-moon')
    })
  })

  describe('destroy()', () => {
    it('stops the weather scheduler', () => {
      makeApp().destroy()

      expect(mockWeatherScheduler.stop).toHaveBeenCalledOnce()
    })

    it('destroys the time display', () => {
      makeApp().destroy()

      expect(mockTimeDisplay.destroy).toHaveBeenCalledOnce()
    })

    it('destroys the NASA moon component', () => {
      makeApp().destroy()

      expect(mockNasaMoonDisplay.destroy).toHaveBeenCalledOnce()
    })
  })

  describe('refresh()', () => {
    it('triggers a weather update', async () => {
      await makeApp().refresh()

      expect(mockWeatherCoordinator.update).toHaveBeenCalledOnce()
    })

    it('updates the time display', async () => {
      await makeApp().refresh()

      expect(mockTimeDisplay.updateDisplay).toHaveBeenCalledOnce()
    })
  })
})
