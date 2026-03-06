/**
 * Main Application Entry Point
 *
 * Orchestrates the weather kiosk application using modular TypeScript components.
 * Initializes services, components, and manages application lifecycle.
 */

import './styles/main.css'

// Services
import { WeatherService } from './services/WeatherService'
import { MoonPhaseService } from './services/MoonPhaseService'

// Configuration
import {
  weatherServiceConfig,
  moonPhaseServiceConfig,
} from './config/environment'

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
import { TimeDisplay } from './components/Time/TimeDisplay'

// Core
import { DOMValidator } from './core/DOMValidator'
import { AssetValidator } from './core/AssetValidator'
import { ComponentFactory } from './core/ComponentFactory'
import { UpdateScheduler } from './core/UpdateScheduler'
import { WeatherUpdateCoordinator } from './core/WeatherUpdateCoordinator'

// Types
import { DEFAULT_APP_CONFIG } from './types/app.types'

export class TabletKioskApp {
  constructor(
    private readonly domValidator: DOMValidator,
    private readonly assetValidator: AssetValidator,
    private readonly weatherCoordinator: WeatherUpdateCoordinator,
    private readonly weatherScheduler: UpdateScheduler,
    private readonly timeDisplay: TimeDisplay,
    private readonly errorDisplay: ErrorDisplay
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

    this.timeDisplay.startUpdates(
      error => {
        console.error('Time display error:', error)
        this.errorDisplay.show('clock-update', error)
      },
      () => this.errorDisplay.remove('clock-update')
    )
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
    this.timeDisplay.destroy()
  }

  async refresh(): Promise<void> {
    await this.weatherCoordinator.update()
    this.timeDisplay.updateDisplay()
  }
}

// Global app instance
let app: TabletKioskApp | null = null

function createApp(errorDisplay: ErrorDisplay): TabletKioskApp {
  const weatherService = new WeatherService(weatherServiceConfig)
  const moonPhaseService = new MoonPhaseService(moonPhaseServiceConfig)
  const componentFactory = new ComponentFactory(
    weatherService,
    moonPhaseService
  )

  const weatherDisplay = componentFactory.createWeatherDisplay()
  const weatherForecast = componentFactory.createWeatherForecast()
  const astronomyTimes = componentFactory.createAstronomyTimes()
  const moonPhase = componentFactory.createMoonPhase()
  const timeDisplay = componentFactory.createTimeDisplay()

  const weatherCoordinator = new WeatherUpdateCoordinator(
    weatherService,
    weatherDisplay,
    weatherForecast,
    astronomyTimes,
    moonPhase,
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
    timeDisplay,
    errorDisplay
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
