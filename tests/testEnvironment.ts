/**
 * Test Environment Configuration
 *
 * Mock environment variables for Jest tests since import.meta is not available
 */

// Mock Vite environment variables for tests
const testEnv = {
  VITE_OPENWEATHER_API_KEY: 'test-api-key',
  VITE_LOCATION_LAT: '40.7128',
  VITE_LOCATION_LON: '-74.0060',
  VITE_WEATHER_UPDATE_INTERVAL: '600000',
  VITE_CLOCK_UPDATE_INTERVAL: '1000',
  DEV: false,
  PROD: false,
}

// Mock import.meta for Jest environment
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: testEnv,
    },
  },
  writable: true,
})

export default testEnv
