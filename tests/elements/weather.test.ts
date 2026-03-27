import type { WeatherData } from '../../src/types/weather-domain.types'

const mockGetWeatherData = vi.fn()
const mockSetValue = vi.fn()

vi.mock('../../src/services/WeatherService', () => ({
  WeatherService: vi.fn().mockImplementation(function (this: any) {
    this.getWeatherData = mockGetWeatherData
  }),
}))

vi.mock('@lit/context', async () => {
  const actual =
    await vi.importActual<typeof import('@lit/context')>('@lit/context')
  return {
    ...actual,
    ContextProvider: vi.fn().mockImplementation(function (this: any) {
      this.setValue = mockSetValue
    }),
  }
})

import { Weather } from '../../src/elements/weather'

describe('Weather', () => {
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
})
