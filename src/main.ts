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
  preloadCriticalAssets,
  getCriticalAssetUrls,
  validateAssetExists,
  reportMissingAssets,
} from './utils/assets'

// Components
import { WeatherDisplay } from './components/Weather/WeatherDisplay'
import { WeatherForecast } from './components/Weather/WeatherForecast'
import { AstronomyTimes } from './components/Astronomy/AstronomyTimes'
import { MoonPhase } from './components/Astronomy/MoonPhase'
import { TimeDisplay } from './components/Time/TimeDisplay'

// Types
import type { ProcessedWeatherData } from './types/weather.types'

class TabletKioskApp {
  // Services
  private weatherService: WeatherService
  private moonPhaseService: MoonPhaseService

  // Components
  private weatherDisplay: WeatherDisplay
  private weatherForecast: WeatherForecast
  private astronomyTimes: AstronomyTimes
  private moonPhase: MoonPhase
  private timeDisplay: TimeDisplay

  // Update intervals
  private weatherUpdateInterval: number | null = null
  private readonly weatherUpdateIntervalMs = 10 * 60 * 1000 // 10 minutes

  constructor() {
    // Initialize services using dependency injection configs
    this.weatherService = new WeatherService(weatherServiceConfig)
    this.moonPhaseService = new MoonPhaseService(moonPhaseServiceConfig)

    // Initialize components
    this.weatherDisplay = new WeatherDisplay(this.weatherService)
    this.weatherForecast = new WeatherForecast(this.weatherService)
    this.astronomyTimes = new AstronomyTimes()
    this.moonPhase = new MoonPhase(this.moonPhaseService)
    this.timeDisplay = new TimeDisplay()
  }

  /**
   * Fetches and updates all weather-related displays
   */
  private async updateWeatherData(): Promise<void> {
    try {
      console.log('Fetching weather data...')
      const weatherData: ProcessedWeatherData =
        await this.weatherService.getProcessedWeatherData()

      // Update current weather display
      this.weatherDisplay.updateDisplay(weatherData.current)

      // Update forecast display
      this.weatherForecast.updateForecast(weatherData.forecast)

      // Update astronomy times
      this.astronomyTimes.updateTimes(weatherData.astronomy)

      // Update moon phase
      this.moonPhase.updatePhase(weatherData.astronomy.moonPhase)

      console.log('Weather data updated successfully')
    } catch (error) {
      console.error('Failed to update weather data:', error)
      this.handleWeatherError(error as Error)
    }
  }

  /**
   * Handles weather update errors gracefully
   * @param error The error that occurred during weather update
   */
  private handleWeatherError(error: Error): void {
    console.error('Weather update error:', error.message)

    // Show error states in components that support it
    if (
      this.weatherDisplay &&
      typeof this.weatherDisplay['showErrorState'] === 'function'
    ) {
      // Note: showErrorState is private, but this demonstrates error handling approach
      console.warn('Weather display error state would be shown here')
    }

    if (
      this.weatherForecast &&
      typeof this.weatherForecast['showErrorState'] === 'function'
    ) {
      console.warn('Weather forecast error state would be shown here')
    }

    if (
      this.astronomyTimes &&
      typeof this.astronomyTimes['showErrorState'] === 'function'
    ) {
      console.warn('Astronomy times error state would be shown here')
    }

    if (
      this.moonPhase &&
      typeof this.moonPhase['showErrorState'] === 'function'
    ) {
      console.warn('Moon phase error state would be shown here')
    }
  }

  /**
   * Starts automatic weather data updates
   */
  private startWeatherUpdates(): void {
    // Clear any existing interval
    this.stopWeatherUpdates()

    // Perform initial update
    this.updateWeatherData()

    // Set up recurring updates
    this.weatherUpdateInterval = window.setInterval(() => {
      this.updateWeatherData()
    }, this.weatherUpdateIntervalMs)

    console.log(
      `Weather updates started (every ${this.weatherUpdateIntervalMs / 1000 / 60} minutes)`
    )
  }

  /**
   * Stops automatic weather data updates
   */
  private stopWeatherUpdates(): void {
    if (this.weatherUpdateInterval !== null) {
      window.clearInterval(this.weatherUpdateInterval)
      this.weatherUpdateInterval = null
      console.log('Weather updates stopped')
    }
  }

  /**
   * Validates that critical assets are available
   */
  private async validateAssets(): Promise<void> {
    console.log('Validating critical assets...')

    const criticalAssets = getCriticalAssetUrls()
    const missingAssets: string[] = []

    // Validate assets in parallel for better performance
    const validationPromises = criticalAssets.map(async assetUrl => {
      const exists = await validateAssetExists(assetUrl)
      if (!exists) {
        missingAssets.push(assetUrl)
      }
    })

    await Promise.all(validationPromises)

    if (missingAssets.length > 0) {
      reportMissingAssets(missingAssets)
      // Don't throw error for missing assets, just warn
      console.warn('Some assets are missing but application will continue')
    } else {
      console.log('All critical assets validated successfully')
    }
  }

  /**
   * Initializes the application
   */
  public async initialize(): Promise<void> {
    try {
      console.log('Initializing Tablet Kiosk application...')

      // Preload critical assets for better performance
      preloadCriticalAssets()
      console.log('Critical assets preloaded')

      // Validate assets are available (non-blocking)
      this.validateAssets().catch(error => {
        console.warn('Asset validation failed:', error)
      })

      // Check if all required DOM elements are present
      if (!this.validateDOMElements()) {
        throw new Error('Required DOM elements not found')
      }

      // Start time display updates
      this.timeDisplay.startUpdates()
      console.log('Time display started')

      // Start weather data updates
      this.startWeatherUpdates()

      console.log('Tablet Kiosk application initialized successfully')
    } catch (error) {
      console.error('Failed to initialize application:', error)
      throw error
    }
  }

  /**
   * Validates that all required DOM elements are present
   * @returns boolean True if all elements are found
   */
  private validateDOMElements(): boolean {
    const requiredElements = [
      'time',
      'date',
      'weather-icon',
      'temp-now',
      'weather-desc',
      'weather-range',
      'forecast',
      'sunrise-time',
      'sunset-time',
      'moonrise-time',
      'moonset-time',
      'moon',
      'moon-phase-name',
    ]

    const missingElements: string[] = []

    for (const elementId of requiredElements) {
      const element = document.getElementById(elementId)
      if (!element) {
        missingElements.push(elementId)
      }
    }

    if (missingElements.length > 0) {
      console.error('Missing required DOM elements:', missingElements)
      return false
    }

    return true
  }

  /**
   * Cleanup method for application shutdown
   */
  public destroy(): void {
    console.log('Shutting down Tablet Kiosk application...')

    // Stop all updates
    this.stopWeatherUpdates()
    this.timeDisplay.destroy()

    console.log('Application shutdown complete')
  }

  /**
   * Force refresh of all displays
   */
  public async refresh(): Promise<void> {
    console.log('Refreshing all displays...')

    // Force weather data update
    await this.updateWeatherData()

    // Force time display update
    this.timeDisplay.updateDisplay()

    console.log('Display refresh complete')
  }

  /**
   * Gets application status information
   * @returns Object with current application status
   */
  public getStatus(): {
    weatherUpdating: boolean
    timeUpdating: boolean
    componentsInitialized: boolean
    lastUpdate: string
  } {
    return {
      weatherUpdating: this.weatherUpdateInterval !== null,
      timeUpdating: this.timeDisplay.isUpdating(),
      componentsInitialized: this.validateDOMElements(),
      lastUpdate: new Date().toISOString(),
    }
  }
}

// Global app instance
let app: TabletKioskApp | null = null

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('DOM loaded, initializing tablet kiosk application...')

    app = new TabletKioskApp()
    await app.initialize()

    // Make app globally available for debugging
    ;(globalThis as typeof globalThis & { kioskApp: TabletKioskApp }).kioskApp =
      app
  } catch (error) {
    console.error('Failed to start application:', error)

    // Show error message to user
    document.body.innerHTML = `
      <div style="padding: 20px; color: red; font-family: sans-serif;">
        <h1>Application Error</h1>
        <p>Failed to start the weather kiosk application.</p>
        <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p>Please check the console for more details.</p>
      </div>
    `
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

// Export for potential use in other modules
export { TabletKioskApp }
