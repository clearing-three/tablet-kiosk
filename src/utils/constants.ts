/**
 * Application constants and configuration values
 */

/**
 * Update intervals in milliseconds
 */
export const UPDATE_INTERVALS = {
  /** Clock update interval - 1 second */
  CLOCK: 1000,
  /** Weather data update interval - 10 minutes */
  WEATHER: 10 * 60 * 1000,
} as const

/**
 * Weather forecast configuration
 */
export const FORECAST_CONFIG = {
  /** Number of forecast days to display (excluding today) */
  DAYS_TO_SHOW: 3,
  /** Starting index for forecast (1 = skip today) */
  START_INDEX: 1,
} as const

/**
 * Moon phase configuration
 */
export const MOON_PHASE_CONFIG = {
  /** SVG viewBox dimensions for moon phase display */
  SVG_VIEWBOX: '0 0 200 200',
  /** SVG preserve aspect ratio setting */
  SVG_ASPECT_RATIO: 'xMidYMid meet',
} as const

/**
 * API configuration defaults
 */
export const API_CONFIG = {
  /** OpenWeatherMap API base URL for One Call 3.0 */
  BASE_URL: 'https://api.openweathermap.org/data/3.0/onecall',
  /** Default units for API requests */
  UNITS: 'imperial',
  /** API exclusions for unnecessary data */
  EXCLUDE: 'minutely,hourly,alerts',
} as const

/**
 * Asset paths and file locations
 */
export const ASSET_PATHS = {
  /** Base path for weather icon SVG files */
  WEATHER_ICONS: 'weather-icons',
} as const

/**
 * Default values and fallbacks
 */
export const DEFAULTS = {
  /** Default icon when mapping fails */
  FALLBACK_ICON: 'na',
  /** Default time display when moon times are unavailable */
  MISSING_MOON_TIME: '-',
  /** Default moon phase value */
  DEFAULT_MOON_PHASE: 0,
} as const

/**
 * CSS classes used in dynamic content generation
 */
export const CSS_CLASSES = {
  FORECAST_DAY: 'forecast-day',
  FORECAST_DAY_NAME: 'forecast-day-name',
  FORECAST_ICON: 'forecast-icon',
  FORECAST_DESC: 'forecast-desc',
  FORECAST_RANGE: 'forecast-range',
} as const

/**
 * Time formatting options
 */
export const TIME_FORMAT_OPTIONS = {
  /** 24-hour time format options */
  HOUR_24: {
    hour: '2-digit' as const,
    minute: '2-digit' as const,
    hour12: false,
  },
  /** Short weekday format options */
  SHORT_WEEKDAY: {
    weekday: 'short' as const,
  },
  /** Long date format options */
  LONG_DATE: {
    weekday: 'long' as const,
    month: 'long' as const,
    day: 'numeric' as const,
  },
} as const

/**
 * Application error messages
 */
export const ERROR_MESSAGES = {
  API_ERROR: 'Failed to fetch weather data',
  NETWORK_ERROR: 'Network connection error',
  INVALID_RESPONSE: 'Invalid API response',
  MOON_PHASE_ERROR: 'Error updating moon phase',
  DOM_ELEMENT_NOT_FOUND: 'Required DOM element not found',
} as const
