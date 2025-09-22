/**
 * Mock environment configuration for tests
 */

export const environment = {
  openWeatherApiKey: 'test-api-key',
  location: {
    lat: '40.7128',
    lon: '-74.0060',
  },
  intervals: {
    clockUpdate: 1000, // 1 second
    weatherUpdate: 600000, // 10 minutes
  },
}

export const isDevelopment = false
export const isProduction = false
