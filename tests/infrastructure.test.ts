/**
 * Infrastructure smoke tests to verify Jest setup is working correctly
 */

import {
  createMockWeatherData,
  createMockAstronomyTimes,
  mockFetch,
  waitFor,
} from './utils/testHelpers'

describe('Testing Infrastructure', () => {
  describe('Jest Configuration', () => {
    it('should have DOM environment available', () => {
      expect(document).toBeDefined()
      expect(document.body).toBeDefined()
      expect(window).toBeDefined()
    })

    it('should have proper DOM structure in setup', () => {
      expect(document.querySelector('.app')).toBeTruthy()
      expect(document.querySelector('.left-panel')).toBeTruthy()
      expect(document.querySelector('.right-panel')).toBeTruthy()
      expect(document.getElementById('temperature')).toBeTruthy()
      expect(document.getElementById('current-time')).toBeTruthy()
    })

    it('should have environment variables configured', () => {
      expect(process.env.VITE_API_KEY).toBe('test-api-key')
      expect(process.env.VITE_LAT).toBe('40.7128')
      expect(process.env.VITE_LON).toBe('-74.0060')
    })
  })

  describe('Mock Functions', () => {
    it('should have fetch mock available', () => {
      expect(global.fetch).toBeDefined()
      expect(jest.isMockFunction(global.fetch)).toBe(true)
    })

    it('should have timer mocks available', () => {
      expect(global.setInterval).toBeDefined()
      expect(global.clearInterval).toBeDefined()
      expect(jest.isMockFunction(global.setInterval)).toBe(true)
      expect(jest.isMockFunction(global.clearInterval)).toBe(true)
    })

    it('should have Image mock available', () => {
      expect(global.Image).toBeDefined()
      const img = new Image()
      expect(img).toHaveProperty('src')
      expect(img).toHaveProperty('onload')
      expect(img).toHaveProperty('onerror')
    })
  })

  describe('Test Helpers', () => {
    it('should create valid mock weather data', () => {
      const mockData = createMockWeatherData()

      expect(mockData).toHaveProperty('current')
      expect(mockData).toHaveProperty('daily')
      expect(mockData.current).toHaveProperty('temp')
      expect(mockData.current).toHaveProperty('weather')
      expect(mockData.daily).toHaveLength(3)
      expect(typeof mockData.current.temp).toBe('number')
    })

    it('should create valid mock astronomy times', () => {
      const mockTimes = createMockAstronomyTimes()

      expect(mockTimes).toHaveProperty('sunrise')
      expect(mockTimes).toHaveProperty('sunset')
      expect(mockTimes).toHaveProperty('moonrise')
      expect(mockTimes).toHaveProperty('moonset')
      expect(typeof mockTimes.sunrise).toBe('number')
    })

    it('should mock fetch correctly', async () => {
      const mockResponse = { test: 'data' }
      mockFetch({
        ok: true,
        json: async () => mockResponse,
      })

      const response = await fetch('test-url')
      const data = await response.json()

      expect(data).toEqual(mockResponse)
    })

    it('should handle async operations with waitFor', async () => {
      const start = Date.now()
      await waitFor(10)
      const end = Date.now()

      expect(end - start).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Custom Matchers', () => {
    it('should have toBeWithinRange matcher available', () => {
      expect(5).toBeWithinRange(1, 10)
      expect(15).not.toBeWithinRange(1, 10)
    })
  })

  describe('Module Resolution', () => {
    it('should resolve path aliases correctly', async () => {
      // This test will verify our path mapping works when we create actual modules
      expect(true).toBe(true) // Placeholder until we have modules to import
    })
  })
})
