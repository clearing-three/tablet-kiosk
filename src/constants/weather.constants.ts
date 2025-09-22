/**
 * Weather-related constants for the application
 */

/**
 * Minimum number of daily forecast days required from the weather API.
 * This includes today + 3 forecast days for the weather display.
 */
export const REQUIRED_FORECAST_DAYS = 4

/**
 * Number of forecast days to display (excluding today)
 */
export const DISPLAY_FORECAST_DAYS = REQUIRED_FORECAST_DAYS - 1
