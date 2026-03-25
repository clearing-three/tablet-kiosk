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
import { CurrentConditionsView } from './components/Weather/CurrentConditionsView'
import { ForecastView } from './components/Weather/ForecastView'
import { SunView } from './components/Astronomy/SunView'

// Core
import { DOMValidator } from './core/DOMValidator'
import { AssetValidator } from './core/AssetValidator'

// Controllers
import { TimeController } from './controllers/TimeController'
import { MoonController } from './controllers/MoonController'
import { WeatherController } from './controllers/WeatherController'

// Types
import { DEFAULT_APP_CONFIG } from './types/app.types'

export class TabletKioskApp {
  constructor(
    private readonly domValidator: DOMValidator,
    private readonly assetValidator: AssetValidator,
    private readonly weatherController: WeatherController,
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
    this.weatherController.start()
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
    this.weatherController.destroy()
    this.timeController.destroy()
    this.moonController.destroy()
  }

  async refresh(): Promise<void> {
    await this.weatherController.update()
    this.timeController.updateDisplay()
  }
}

// Global app instance
let app: TabletKioskApp | null = null

function createApp(errorDisplay: ErrorDisplay): TabletKioskApp {
  const weatherService = new WeatherService(weatherServiceConfig)

  const timeView = new TimeView()
  const timeController = new TimeController(timeView, errorDisplay)

  const nasaMoonService = new NasaMoonService()
  const moonView = new MoonView()
  const moonController = new MoonController(
    moonView,
    nasaMoonService,
    errorDisplay
  )

  const weatherView = new CurrentConditionsView()
  const forecastView = new ForecastView()
  const sunView = new SunView()
  const weatherController = new WeatherController(
    weatherView,
    forecastView,
    sunView,
    weatherService,
    errorDisplay,
    DEFAULT_APP_CONFIG.weatherUpdateIntervalMs
  )

  return new TabletKioskApp(
    new DOMValidator(),
    new AssetValidator(),
    weatherController,
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
