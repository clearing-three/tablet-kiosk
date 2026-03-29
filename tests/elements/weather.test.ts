import type { WeatherData } from '../../src/types/weather-domain.types'

import { Weather } from '../../src/elements/weather'

const mockGetWeatherData = vi.fn()
const mockSetValue = vi.fn()

vi.mock('../../src/services/weather-service', () => ({
  WeatherService: vi.fn().mockImplementation(function (this: any) {
    this.getWeatherData = mockGetWeatherData
  }),
}))

vi.mock('@lit/context', async () => {
  const actual
    = await vi.importActual<typeof import('@lit/context')>('@lit/context')
  return {
    ...actual,
    ContextProvider: vi.fn().mockImplementation(function (this: any) {
      this.setValue = mockSetValue
    }),
  }
})

describe('weather', () => {
  let element: Weather
  let mockWeatherData: WeatherData

  const waitForWeatherUpdate = async (el: Weather) => {
    await el.updateComplete
    await Promise.resolve()
    await el.updateComplete
  }

  beforeEach(() => {
    vi.useFakeTimers()
    mockGetWeatherData.mockClear()
    mockSetValue.mockClear()

    mockWeatherData = {} as WeatherData

    mockGetWeatherData.mockResolvedValue(mockWeatherData)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should not fetch weather before being connected', () => {
      // given
      element = document.createElement('x-weather') as Weather

      // expect
      expect(mockGetWeatherData).not.toHaveBeenCalled()
    })
  })

  describe('connectedCallback', () => {
    it('should fetch weather and update context on connection', async () => {
      // given
      element = document.createElement('x-weather') as Weather

      // when
      document.body.appendChild(element)
      await waitForWeatherUpdate(element)

      // then
      expect(mockGetWeatherData).toHaveBeenCalledOnce()
      expect(mockSetValue).toHaveBeenCalledWith(mockWeatherData)
      element.remove()
    })

    it('should update weather every 10 minutes', async () => {
      // given
      element = document.createElement('x-weather') as Weather
      document.body.appendChild(element)
      await waitForWeatherUpdate(element)

      // then
      expect(mockGetWeatherData).toHaveBeenCalledOnce()

      // when
      await vi.advanceTimersByTimeAsync(Weather.TEN_MINUTES_MILLIS)

      // then
      expect(mockGetWeatherData).toHaveBeenCalledTimes(2)

      // when
      await vi.advanceTimersByTimeAsync(Weather.TEN_MINUTES_MILLIS)

      // then
      expect(mockGetWeatherData).toHaveBeenCalledTimes(3)
      element.remove()
    })
  })

  describe('disconnectedCallback', () => {
    it('should stop updating weather when disconnected', async () => {
      // given
      element = document.createElement('x-weather') as Weather
      document.body.appendChild(element)
      await waitForWeatherUpdate(element)

      const callsAfterConnect = mockGetWeatherData.mock.calls.length

      // when
      element.remove()
      await vi.advanceTimersByTimeAsync(Weather.TEN_MINUTES_MILLIS)

      // then
      expect(mockGetWeatherData).toHaveBeenCalledTimes(callsAfterConnect)
    })

    it('should handle disconnection safely when not connected', () => {
      // given
      element = document.createElement('x-weather') as Weather

      // expect
      expect(() => element.disconnectedCallback()).not.toThrow()
    })
  })

  describe('reconnection', () => {
    it('should restart timer when reconnected', async () => {
      // given
      element = document.createElement('x-weather') as Weather
      document.body.appendChild(element)
      await waitForWeatherUpdate(element)

      const callsAfterConnect = mockGetWeatherData.mock.calls.length

      // when
      element.remove()
      await vi.advanceTimersByTimeAsync(Weather.TEN_MINUTES_MILLIS)

      // then
      expect(mockGetWeatherData).toHaveBeenCalledTimes(callsAfterConnect)

      // when
      document.body.appendChild(element)
      await waitForWeatherUpdate(element)
      await vi.advanceTimersByTimeAsync(Weather.TEN_MINUTES_MILLIS)

      // then
      expect(mockGetWeatherData).toHaveBeenCalledTimes(callsAfterConnect + 2)
      element.remove()
    })
  })

  describe('error handling', () => {
    it('should dispatch error-occurred event when weather fetch fails', async () => {
      // given
      const error = new Error('fetch failed')
      mockGetWeatherData.mockRejectedValue(error)
      element = document.createElement('x-weather') as Weather

      const errorHandler = vi.fn()
      element.addEventListener('error-occurred', errorHandler)

      // when
      document.body.appendChild(element)
      await waitForWeatherUpdate(element)

      // then
      expect(errorHandler).toHaveBeenCalledOnce()
      const event = errorHandler.mock.calls[0]![0] as CustomEvent
      expect(event.detail.source).toBe('Weather')
      expect(event.detail.error).toBe(error)
      expect(event.detail.timestamp).toBeInstanceOf(Date)
      expect(event.bubbles).toBe(true)
      expect(event.composed).toBe(true)
      element.remove()
    })

    it('should continue updating weather after error', async () => {
      // given
      const error = new Error('fetch failed')
      mockGetWeatherData.mockRejectedValueOnce(error)
      mockGetWeatherData.mockResolvedValue(mockWeatherData)
      element = document.createElement('x-weather') as Weather

      // when
      document.body.appendChild(element)
      await waitForWeatherUpdate(element)

      // then
      expect(mockGetWeatherData).toHaveBeenCalledOnce()

      // when
      await vi.advanceTimersByTimeAsync(Weather.TEN_MINUTES_MILLIS)

      // then
      expect(mockGetWeatherData).toHaveBeenCalledTimes(2)
      expect(mockSetValue).toHaveBeenCalledWith(mockWeatherData)
      element.remove()
    })
  })
})
