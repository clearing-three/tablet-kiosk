/**
 * Weather icon mapping utilities for OpenWeatherMap icons to local SVG files
 */

type OWMIconCode
  = | '01d'
    | '01n' // Clear sky
    | '02d'
    | '02n' // Few clouds
    | '03d'
    | '03n' // Scattered clouds
    | '04d'
    | '04n' // Broken clouds
    | '09d'
    | '09n' // Shower rain
    | '10d'
    | '10n' // Rain
    | '11d'
    | '11n' // Thunderstorm
    | '13d'
    | '13n' // Snow
    | '50d'
    | '50n' // Mist

type LocalIconName
  = | 'clear-day'
    | 'clear-night'
    | 'partly-cloudy-day'
    | 'partly-cloudy-night'
    | 'overcast'
    | 'rain'
    | 'thunderstorms-day'
    | 'thunderstorms-night'
    | 'snow'
    | 'mist'
    | 'na' // fallback for unknown codes

/**
 * Mapping from OpenWeatherMap icon codes to local SVG file names
 */
const ICON_MAP: Record<OWMIconCode, LocalIconName> = {
  '01d': 'clear-day',
  '01n': 'clear-night',
  '02d': 'partly-cloudy-day',
  '02n': 'partly-cloudy-night',
  '03d': 'partly-cloudy-day',
  '03n': 'partly-cloudy-night',
  '04d': 'overcast',
  '04n': 'overcast',
  '09d': 'rain',
  '09n': 'rain',
  '10d': 'rain',
  '10n': 'rain',
  '11d': 'thunderstorms-day',
  '11n': 'thunderstorms-night',
  '13d': 'snow',
  '13n': 'snow',
  '50d': 'mist',
  '50n': 'mist',
}

/**
 * Maps OpenWeatherMap icon code to local SVG file name
 * @param owmCode OpenWeatherMap icon code (e.g., "01d", "10n")
 * @returns Local SVG file name without extension (e.g., "clear-day", "rain")
 */
export function mapOWMIconToSVG(owmCode: string): LocalIconName {
  // Type guard to ensure the code is a valid OWM icon code
  if (isValidOWMIconCode(owmCode)) {
    return ICON_MAP[owmCode]
  }

  // Fallback for unknown codes
  console.warn(
    `Unknown OpenWeatherMap icon code: ${owmCode}, using fallback 'na'`,
  )
  return 'na'
}

/**
 * Type guard to check if a string is a valid OpenWeatherMap icon code
 * @param code String to check
 * @returns True if the code is a valid OWM icon code
 */
function isValidOWMIconCode(code: string): code is OWMIconCode {
  return Object.hasOwn(ICON_MAP, code)
}
