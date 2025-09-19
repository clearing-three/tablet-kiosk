/**
 * Asset Management Utilities
 *
 * Provides helper functions for managing assets in the Vite build system.
 * Ensures proper asset loading in both development and production environments.
 */

import { getWeatherIconPath } from './iconMapper'

/**
 * Preloads critical weather icons to ensure they're available when needed
 * This helps with performance and ensures icons are bundled properly
 */
export function preloadCriticalAssets(): void {
  // Most commonly used weather icons that should be preloaded
  const criticalIcons = [
    'clear-day',
    'clear-night',
    'partly-cloudy-day',
    'partly-cloudy-night',
    'overcast',
    'rain',
    'na',
  ]

  criticalIcons.forEach(iconName => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = `/weather-icons/${iconName}.svg`
    document.head.appendChild(link)
  })

  // Preload astronomy icons used in the UI
  const astronomyIcons = ['sunrise', 'sunset', 'moonrise', 'moonset']
  astronomyIcons.forEach(iconName => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = `/weather-icons/${iconName}.svg`
    document.head.appendChild(link)
  })
}

/**
 * Gets a weather icon URL with proper cache busting if needed
 * @param owmCode OpenWeatherMap icon code
 * @returns Full URL to the weather icon
 */
export function getWeatherIconUrl(owmCode: string): string {
  return getWeatherIconPath(owmCode)
}

/**
 * Validates that an asset exists by attempting to load it
 * @param assetPath Path to the asset to validate
 * @returns Promise<boolean> True if asset exists and loads successfully
 */
export async function validateAssetExists(assetPath: string): Promise<boolean> {
  try {
    const response = await fetch(assetPath, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Gets all asset URLs that should be validated on application startup
 * @returns Array of asset URLs to validate
 */
export function getCriticalAssetUrls(): string[] {
  return [
    '/weather-icons/clear-day.svg',
    '/weather-icons/clear-night.svg',
    '/weather-icons/partly-cloudy-day.svg',
    '/weather-icons/partly-cloudy-night.svg',
    '/weather-icons/overcast.svg',
    '/weather-icons/rain.svg',
    '/weather-icons/thunderstorms-day.svg',
    '/weather-icons/thunderstorms-night.svg',
    '/weather-icons/snow.svg',
    '/weather-icons/mist.svg',
    '/weather-icons/na.svg',
    '/weather-icons/sunrise.svg',
    '/weather-icons/sunset.svg',
    '/weather-icons/moonrise.svg',
    '/weather-icons/moonset.svg',
    '/moon-phase.js',
  ]
}

/**
 * Reports missing assets to the console for debugging
 * @param missingAssets Array of missing asset paths
 */
export function reportMissingAssets(missingAssets: string[]): void {
  if (missingAssets.length > 0) {
    console.warn('Missing assets detected:', missingAssets)
    console.warn('This may cause display issues in the application')
  }
}
