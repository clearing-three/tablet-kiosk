import type { Mock } from 'vitest'
import type { ReactiveControllerHost } from 'lit'
import { PollingController } from '../../src/controllers/polling-controller'

describe('PollingController', () => {
  let mockHost: ReactiveControllerHost
  let mockFetchFn: Mock<() => Promise<string>>
  let controller: PollingController<string>
  const intervalMillis = 1000

  beforeEach(() => {
    vi.useFakeTimers()
    mockHost = {
      addController: vi.fn(),
      removeController: vi.fn(),
      requestUpdate: vi.fn(),
      updateComplete: Promise.resolve(true),
    }
    mockFetchFn = vi.fn()
  })

  afterEach(() => {
    if (controller) {
      controller.hostDisconnected()
    }
    vi.useRealTimers()
  })

  describe('constructor', () => {
    it('should register itself with the host', () => {
      controller = new PollingController(mockHost, mockFetchFn, intervalMillis)

      expect(mockHost.addController).toHaveBeenCalledWith(controller)
      expect(mockHost.addController).toHaveBeenCalledOnce()
    })

    it('should not start polling in constructor', () => {
      controller = new PollingController(mockHost, mockFetchFn, intervalMillis)

      expect(mockFetchFn).not.toHaveBeenCalled()
    })

    it('should initialize with undefined data', () => {
      controller = new PollingController(mockHost, mockFetchFn, intervalMillis)

      expect(controller.data).toBeUndefined()
    })
  })

  describe('hostConnected', () => {
    it('should fetch data immediately', async () => {
      mockFetchFn.mockResolvedValue('initial data')
      controller = new PollingController(mockHost, mockFetchFn, intervalMillis)

      await controller.hostConnected()

      expect(mockFetchFn).toHaveBeenCalledOnce()
    })

    it('should update data with fetched value', async () => {
      const testData = 'test data'
      mockFetchFn.mockResolvedValue(testData)
      controller = new PollingController(mockHost, mockFetchFn, intervalMillis)

      await controller.hostConnected()

      expect(controller.data).toBe(testData)
    })

    it('should request host update after initial fetch', async () => {
      mockFetchFn.mockResolvedValue('data')
      controller = new PollingController(mockHost, mockFetchFn, intervalMillis)

      await controller.hostConnected()

      expect(mockHost.requestUpdate).toHaveBeenCalledOnce()
    })

    it('should start polling interval', async () => {
      mockFetchFn.mockResolvedValue('data')
      controller = new PollingController(mockHost, mockFetchFn, intervalMillis)

      await controller.hostConnected()

      // Advance time by one interval
      await vi.advanceTimersByTimeAsync(intervalMillis)

      expect(mockFetchFn).toHaveBeenCalledTimes(2) // initial + 1 interval
    })

    it('should continue polling on subsequent intervals', async () => {
      mockFetchFn.mockResolvedValue('data')
      controller = new PollingController(mockHost, mockFetchFn, intervalMillis)

      await controller.hostConnected()

      // Advance time by three intervals
      await vi.advanceTimersByTimeAsync(intervalMillis * 3)

      expect(mockFetchFn).toHaveBeenCalledTimes(4) // initial + 3 intervals
    })

    it('should update data on each poll', async () => {
      mockFetchFn
        .mockResolvedValueOnce('data 1')
        .mockResolvedValueOnce('data 2')
        .mockResolvedValueOnce('data 3')
      controller = new PollingController(mockHost, mockFetchFn, intervalMillis)

      await controller.hostConnected()
      expect(controller.data).toBe('data 1')

      await vi.advanceTimersByTimeAsync(intervalMillis)
      expect(controller.data).toBe('data 2')

      await vi.advanceTimersByTimeAsync(intervalMillis)
      expect(controller.data).toBe('data 3')
    })

    it('should request host update on each poll', async () => {
      mockFetchFn.mockResolvedValue('data')
      controller = new PollingController(mockHost, mockFetchFn, intervalMillis)

      await controller.hostConnected()
      await vi.advanceTimersByTimeAsync(intervalMillis * 2)

      expect(mockHost.requestUpdate).toHaveBeenCalledTimes(3) // initial + 2 intervals
    })
  })

  describe('hostDisconnected', () => {
    it('should clear the polling interval', async () => {
      mockFetchFn.mockResolvedValue('data')
      controller = new PollingController(mockHost, mockFetchFn, intervalMillis)

      await controller.hostConnected()
      controller.hostDisconnected()

      const callsBefore = mockFetchFn.mock.calls.length
      await vi.advanceTimersByTimeAsync(intervalMillis * 3)

      expect(mockFetchFn).toHaveBeenCalledTimes(callsBefore)
    })

    it('should be safe to call when not connected', () => {
      controller = new PollingController(mockHost, mockFetchFn, intervalMillis)

      expect(() => controller.hostDisconnected()).not.toThrow()
    })

    it('should be safe to call multiple times', async () => {
      mockFetchFn.mockResolvedValue('data')
      controller = new PollingController(mockHost, mockFetchFn, intervalMillis)

      await controller.hostConnected()
      controller.hostDisconnected()
      controller.hostDisconnected()

      expect(() => controller.hostDisconnected()).not.toThrow()
    })
  })

  describe('error handling', () => {
    it('should propagate fetch errors on initial connection', async () => {
      mockFetchFn.mockRejectedValue(new Error('fetch failed'))
      controller = new PollingController(mockHost, mockFetchFn, intervalMillis)

      await expect(controller.hostConnected()).rejects.toThrow('fetch failed')
    })
  })

  describe('different data types', () => {
    it('should handle number data', async () => {
      const numberFetch = vi.fn().mockResolvedValue(42)
      const numberController = new PollingController(
        mockHost,
        numberFetch,
        intervalMillis
      )

      await numberController.hostConnected()

      expect(numberController.data).toBe(42)
    })

    it('should handle object data', async () => {
      const testObject = { id: 1, name: 'test' }
      const objectFetch = vi.fn().mockResolvedValue(testObject)
      const objectController = new PollingController(
        mockHost,
        objectFetch,
        intervalMillis
      )

      await objectController.hostConnected()

      expect(objectController.data).toEqual(testObject)
    })

    it('should handle array data', async () => {
      const testArray = [1, 2, 3]
      const arrayFetch = vi.fn().mockResolvedValue(testArray)
      const arrayController = new PollingController(
        mockHost,
        arrayFetch,
        intervalMillis
      )

      await arrayController.hostConnected()

      expect(arrayController.data).toEqual(testArray)
    })
  })

  describe('different polling intervals', () => {
    it('should respect custom interval timing', async () => {
      const customInterval = 5000
      mockFetchFn.mockResolvedValue('data')
      controller = new PollingController(
        mockHost,
        mockFetchFn,
        customInterval
      )

      await controller.hostConnected()

      // Should not poll yet at 1s
      await vi.advanceTimersByTimeAsync(1000)
      expect(mockFetchFn).toHaveBeenCalledOnce() // only initial

      // Should poll at 5s
      await vi.advanceTimersByTimeAsync(4000)
      expect(mockFetchFn).toHaveBeenCalledTimes(2) // initial + 1 interval
    })
  })

  describe('reconnection', () => {
    it('should allow reconnection after disconnection', async () => {
      mockFetchFn.mockResolvedValue('data')
      controller = new PollingController(mockHost, mockFetchFn, intervalMillis)

      await controller.hostConnected()
      controller.hostDisconnected()

      const callsBefore = mockFetchFn.mock.calls.length

      await controller.hostConnected()
      await vi.advanceTimersByTimeAsync(intervalMillis)

      expect(mockFetchFn).toHaveBeenCalledTimes(callsBefore + 2) // reconnect + 1 interval
    })
  })
})
