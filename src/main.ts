/**
 * Main Application Entry Point
 *
 * Orchestrates the weather kiosk application using modular TypeScript components.
 * Initializes services, components, and manages application lifecycle.
 */

import './styles/main.css'

// Services
import { WeatherService } from './services/WeatherService'
import { NasaMoonService } from './services/NasaMoonService'

// Configuration
import { weatherServiceConfig } from './config/environment'

// Asset management
import {
  preloadAssets,
  getAssetUrls,
  reportMissingAssets,
} from './utils/assets'

// Constants
import { DOM_IDS } from './utils/constants'

// Components
import { ErrorDisplay } from './components/ErrorDisplay'
import { TimeView } from './components/Time/TimeView'
import { MoonView } from './components/Astronomy/MoonView'

// Core
import { DOMValidator } from './core/DOMValidator'
import { AssetValidator } from './core/AssetValidator'
import { ComponentFactory } from './core/ComponentFactory'
import { UpdateScheduler } from './core/UpdateScheduler'
import { WeatherUpdateCoordinator } from './core/WeatherUpdateCoordinator'

// Controllers
import { TimeController } from './controllers/TimeController'
import { MoonController } from './controllers/MoonController'

// Types
import { DEFAULT_APP_CONFIG } from './types/app.types'

export class TabletKioskApp {
  constructor(
    private readonly domValidator: DOMValidator,
    private readonly assetValidator: AssetValidator,
    private readonly weatherCoordinator: WeatherUpdateCoordinator,
    private readonly weatherScheduler: UpdateScheduler,
    private readonly timeController: TimeController,
    private readonly moonController: MoonController
  ) {}

  async initialize(): Promise<void> {
    const domValidation = this.domValidator.validate(Object.values(DOM_IDS))
    if (!domValidation.valid) {
      throw new Error(
        `Missing DOM elements: ${domValidation.missing.join(', ')}`
      )
    }

    this.validateAssetsAsync()
    preloadAssets()

    this.timeController.start()
    this.moonController.start()
    this.weatherScheduler.start(() => this.weatherCoordinator.update())
  }

  private async validateAssetsAsync(): Promise<void> {
    try {
      const assetValidation =
        await this.assetValidator.validateAll(getAssetUrls())
      if (!assetValidation.valid) {
        reportMissingAssets(assetValidation.missing)
      }
    } catch (error) {
      console.warn('Asset validation failed:', error)
    }
  }

  destroy(): void {
    this.weatherScheduler.stop()
    this.timeController.destroy()
    this.moonController.destroy()
  }

  async refresh(): Promise<void> {
    await this.weatherCoordinator.update()
    this.timeController.updateDisplay()
  }
}

// Global app instance
let app: TabletKioskApp | null = null

function createApp(errorDisplay: ErrorDisplay): TabletKioskApp {
  const weatherService = new WeatherService(weatherServiceConfig)
  const componentFactory = new ComponentFactory()

  const weatherDisplay = componentFactory.createWeatherDisplay()
  const weatherForecast = componentFactory.createWeatherForecast()
  const astronomyTimes = componentFactory.createAstronomyTimes()

  const timeView = new TimeView()
  const timeController = new TimeController(timeView, errorDisplay)

  const nasaMoonService = new NasaMoonService()
  const moonView = new MoonView()
  const moonController = new MoonController(
    moonView,
    nasaMoonService,
    errorDisplay
  )

  const weatherCoordinator = new WeatherUpdateCoordinator(
    weatherService,
    weatherDisplay,
    weatherForecast,
    astronomyTimes,
    errorDisplay
  )
  const weatherScheduler = new UpdateScheduler(
    DEFAULT_APP_CONFIG.weatherUpdateIntervalMs
  )

  return new TabletKioskApp(
    new DOMValidator(),
    new AssetValidator(),
    weatherCoordinator,
    weatherScheduler,
    timeController,
    moonController
  )
}

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
  const errorDisplay = new ErrorDisplay()
  try {
    app = createApp(errorDisplay)
    await app.initialize()

    // Make app globally available for debugging
    ;(globalThis as typeof globalThis & { kioskApp: TabletKioskApp }).kioskApp =
      app
  } catch (error) {
    console.error('Failed to start application:', error)
    errorDisplay.show('init', error)
  }
})

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
  if (app) {
    app.destroy()
  }
})
