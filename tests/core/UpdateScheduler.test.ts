import { UpdateScheduler } from '../../src/core/UpdateScheduler'

describe('UpdateScheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('start()', () => {
    it('calls the callback immediately', () => {
      const callback = vi.fn()
      const scheduler = new UpdateScheduler(1000)

      scheduler.start(callback)

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('calls the callback again after each interval', () => {
      const callback = vi.fn()
      const scheduler = new UpdateScheduler(1000)

      scheduler.start(callback)
      vi.advanceTimersByTime(1000)
      expect(callback).toHaveBeenCalledTimes(2)

      vi.advanceTimersByTime(1000)
      expect(callback).toHaveBeenCalledTimes(3)
    })

    it('stops the previous interval before starting a new one', () => {
      const callback = vi.fn()
      const scheduler = new UpdateScheduler(1000)

      scheduler.start(callback)
      scheduler.start(callback)

      vi.advanceTimersByTime(1000)

      // Two immediate calls + one interval tick from the second start only
      expect(callback).toHaveBeenCalledTimes(3)
    })

    it('accepts an async callback without throwing', async () => {
      const asyncCallback = vi.fn().mockResolvedValue(undefined)
      const scheduler = new UpdateScheduler(1000)

      expect(() => scheduler.start(asyncCallback)).not.toThrow()
      await Promise.resolve()
      expect(asyncCallback).toHaveBeenCalledTimes(1)
    })
  })

  describe('stop()', () => {
    it('prevents further interval calls after stopping', () => {
      const callback = vi.fn()
      const scheduler = new UpdateScheduler(1000)

      scheduler.start(callback)
      scheduler.stop()

      vi.advanceTimersByTime(3000)

      expect(callback).toHaveBeenCalledTimes(1) // only the initial call
    })

    it('is a no-op when not running', () => {
      const scheduler = new UpdateScheduler(1000)

      expect(() => scheduler.stop()).not.toThrow()
    })
  })

  describe('isRunning()', () => {
    it('returns false before start is called', () => {
      const scheduler = new UpdateScheduler(1000)

      expect(scheduler.isRunning()).toBe(false)
    })

    it('returns true after start is called', () => {
      const scheduler = new UpdateScheduler(1000)

      scheduler.start(vi.fn())

      expect(scheduler.isRunning()).toBe(true)
    })

    it('returns false after stop is called', () => {
      const scheduler = new UpdateScheduler(1000)

      scheduler.start(vi.fn())
      scheduler.stop()

      expect(scheduler.isRunning()).toBe(false)
    })
  })
})
