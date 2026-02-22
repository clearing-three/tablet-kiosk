/**
 * Mock Integration Tests
 *
 * Comprehensive tests to verify that all mock systems are working correctly
 * and can be used together for testing the tablet kiosk application.
 */

import type { Mock } from 'vitest'
import {
  OpenWeatherMapMock,
  MoonPhaseMock,
  weatherScenarios,
  getWeatherScenario,
} from './__mocks__'

describe('Mock Integration', () => {
  describe('OpenWeatherMap API Mocks', () => {
    it('should mock successful API responses', async () => {
      OpenWeatherMapMock.mockSuccess()

      const response = await fetch(
        'https://api.openweathermap.org/data/3.0/onecall'
      )
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toMatchObject({
        lat: expect.any(Number),
        lon: expect.any(Number),
        current: expect.objectContaining({
          temp: expect.any(Number),
          weather: expect.any(Array),
        }),
        daily: expect.any(Array),
      })

      OpenWeatherMapMock.verifyApiCallCount(1)
    })

    it('should mock API error responses', async () => {
      OpenWeatherMapMock.mockError('unauthorized')

      const response = await fetch(
        'https://api.openweathermap.org/data/3.0/onecall'
      )
      const errorData = await response.json()

      expect(response.ok).toBe(false)
      expect(response.status).toBe(401)
      expect(errorData).toMatchObject({
        cod: 401,
        message: expect.stringContaining('Invalid API key'),
      })
    })

    it('should mock network failures', async () => {
      OpenWeatherMapMock.mockNetworkFailure()

      await expect(
        fetch('https://api.openweathermap.org/data/3.0/onecall')
      ).rejects.toThrow('Network request failed')
    })

    it('should mock edge case responses', async () => {
      OpenWeatherMapMock.mockEdgeCase('missingMoonData')

      const response = await fetch(
        'https://api.openweathermap.org/data/3.0/onecall'
      )
      const data = await response.json()

      expect(data.daily[0].moonrise).toBe(0)
      expect(data.daily[0].moonset).toBe(0)
    })
  })

  describe('Moon Phase Library Mocks', () => {
    it('should mock moon phase calculations', () => {
      MoonPhaseMock.mockPhase(0.25)

      const phase = (global as any).moon_day(new Date())
      const svgPath = (global as any).phase_junk(0.25)

      expect(phase).toBe(0.25)
      expect(svgPath).toContain('M 50') // SVG path should start with move command
      expect(svgPath).toContain('A ') // Should contain arc commands

      MoonPhaseMock.verifyMoonDayCalled()
      MoonPhaseMock.verifyPhaseJunkCalled(0.25)
    })

    it('should handle different moon phases', () => {
      const phases = [0.0, 0.25, 0.5, 0.75]

      phases.forEach(phase => {
        MoonPhaseMock.mockPhase(phase)
        const svgPath = (global as any).phase_junk(phase)
        expect(svgPath).toBeTruthy()
        expect(typeof svgPath).toBe('string')
      })
    })

    it('should mock moon phase for specific dates', () => {
      const testDate = new Date('2022-01-15T00:00:00Z')
      MoonPhaseMock.mockPhaseForDate(testDate, 0.25)

      const phase = (global as any).moon_day(testDate)
      expect(phase).toBe(0.25)
    })

    it('should handle edge cases in moon phase calculations', () => {
      MoonPhaseMock.mockEdgeCases()

      // Test invalid inputs
      const invalidPhase = (global as any).phase_junk('invalid')
      expect(invalidPhase).toBe('')

      const invalidDate = (global as any).moon_day('not a date')
      expect(invalidDate).toBe(0) // Should default to new moon
    })
  })

  describe('Browser API Mocks', () => {
    it('should mock Image constructor', () => {
      const img = new Image()

      expect(img).toHaveProperty('src')
      expect(img).toHaveProperty('onload')
      expect(img).toHaveProperty('onerror')

      // Test load simulation
      let loadCalled = false
      img.onload = () => {
        loadCalled = true
      }

      // The mock should trigger onload automatically
      setTimeout(() => {
        expect(loadCalled).toBe(true)
      }, 10)
    })

    it('should mock timer functions', () => {
      const callback = vi.fn()

      const intervalId = setInterval(callback, 1000)
      expect(typeof intervalId).toBe('number')

      const timeoutId = setTimeout(callback, 1000)
      expect(typeof timeoutId).toBe('number')

      clearInterval(intervalId)
      clearTimeout(timeoutId)

      expect(setInterval).toHaveBeenCalled()
      expect(setTimeout).toHaveBeenCalled()
      expect(clearInterval).toHaveBeenCalled()
      expect(clearTimeout).toHaveBeenCalled()
    })

    it('should mock localStorage', () => {
      localStorage.setItem('test-key', 'test-value')
      expect(localStorage.getItem('test-key')).toBe('test-value')

      localStorage.removeItem('test-key')
      expect(localStorage.getItem('test-key')).toBeNull()

      localStorage.setItem('key1', 'value1')
      localStorage.setItem('key2', 'value2')
      expect(localStorage.length).toBe(2)

      localStorage.clear()
      expect(localStorage.length).toBe(0)
    })
  })

  describe('Weather Scenario Fixtures', () => {
    it('should provide access to weather scenarios', () => {
      const clearDay = getWeatherScenario('clearSunnyDay')
      expect(clearDay).toMatchObject({
        current: expect.objectContaining({
          weather: expect.arrayContaining([
            expect.objectContaining({
              main: 'Clear',
              description: 'clear sky',
            }),
          ]),
        }),
      })

      const rainyDay = getWeatherScenario('rainyStormyDay')
      expect(rainyDay.current.weather[0].main).toBe('Rain')

      const snowyDay = getWeatherScenario('snowyWinterDay')
      expect(snowyDay.current.weather[0].main).toBe('Snow')
    })

    it('should handle extreme weather scenarios', () => {
      const extremeHeat = getWeatherScenario('extremeHeat')
      expect(extremeHeat.current.temp).toBeGreaterThan(100)

      const extremeCold = getWeatherScenario('extremeCold')
      expect(extremeCold.current.temp).toBeLessThan(0)
    })

    it('should handle edge cases', () => {
      const missingMoon = getWeatherScenario('missingMoonData')
      expect(missingMoon.daily[0].moonrise).toBe(0)
      expect(missingMoon.daily[0].moonset).toBe(0)

      const minimal = getWeatherScenario('minimalResponse')
      expect(minimal.daily).toHaveLength(0)
    })
  })

  describe('Mock Reset and Cleanup', () => {
    it('should reset mocks between tests', () => {
      // Set up some mock state
      OpenWeatherMapMock.mockSuccess()
      MoonPhaseMock.mockPhase(0.5)

      // Verify initial state
      expect((global.fetch as Mock).mock.calls.length).toBeGreaterThanOrEqual(0)

      // Reset should clear mock state
      OpenWeatherMapMock.reset()
      MoonPhaseMock.reset()

      // Verify reset
      expect((global.fetch as Mock).mock.calls.length).toBe(0)
    })

    it('should handle multiple mock setups without conflicts', () => {
      // Set up different mocks
      OpenWeatherMapMock.mockError('rateLimited')
      MoonPhaseMock.mockPhase(0.75)

      // Both should work independently
      expect(
        fetch('https://api.openweathermap.org/data/3.0/onecall')
      ).resolves.toMatchObject({
        status: 429,
      })

      expect((global as any).moon_day(new Date())).toBe(0.75)
    })
  })

  describe('Integration Scenarios', () => {
    it('should support complete application mock scenarios', async () => {
      // Mock successful weather API call
      OpenWeatherMapMock.mockSuccess(weatherScenarios.clearSunnyDay)

      // Mock moon phase for the same date
      MoonPhaseMock.mockPhase(0.25)

      // Test the complete flow
      const weatherResponse = await fetch(
        'https://api.openweathermap.org/data/3.0/onecall'
      )
      const weatherData = await weatherResponse.json()
      const moonPhase = (global as any).moon_day(
        new Date(weatherData.current.dt * 1000)
      )

      expect(weatherData.current.weather[0].main).toBe('Clear')
      expect(moonPhase).toBe(0.25)

      // Verify all APIs were called as expected
      OpenWeatherMapMock.verifyApiCallCount(1)
      MoonPhaseMock.verifyMoonDayCalled()
    })

    it('should handle error scenarios across all mocks', async () => {
      // Mock API failure
      OpenWeatherMapMock.mockNetworkFailure()

      // Mock moon phase edge case
      MoonPhaseMock.mockEdgeCases()

      // Verify error handling
      await expect(
        fetch('https://api.openweathermap.org/data/3.0/onecall')
      ).rejects.toThrow()

      const invalidMoonPhase = (global as any).moon_day('invalid')
      expect(invalidMoonPhase).toBe(0) // Should fallback gracefully
    })
  })
})
