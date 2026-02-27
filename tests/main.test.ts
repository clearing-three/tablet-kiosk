import { TabletKioskApp, REQUIRED_DOM_ELEMENTS } from '../src/main'
import { ErrorDisplay } from '../src/components/ErrorDisplay'

describe('TabletKioskApp', () => {
  describe('validateDOMElements', () => {
    it('returns true when all required elements are present', () => {
      // Setup: Create all required DOM elements
      REQUIRED_DOM_ELEMENTS.forEach(id => {
        const element = document.createElement('div')
        element.id = id
        document.body.appendChild(element)
      })

      // Create app instance
      const errorDisplay = new ErrorDisplay()
      const app = new TabletKioskApp(errorDisplay)

      // Access private method and test
      const result = (app as any).validateDOMElements()

      expect(result).toBe(true)
    })

    it('returns false when a required element is missing', () => {
      // Setup: Create all required DOM elements EXCEPT 'time'
      const requiredIds = REQUIRED_DOM_ELEMENTS.filter(id => id !== 'time')

      requiredIds.forEach(id => {
        const element = document.createElement('div')
        element.id = id
        document.body.appendChild(element)
      })

      // Create app instance
      const errorDisplay = new ErrorDisplay()
      const app = new TabletKioskApp(errorDisplay)

      // Access private method and test
      const result = (app as any).validateDOMElements()

      expect(result).toBe(false)
    })
  })

  describe('stopWeatherUpdates', () => {
    it('clears the interval and sets it to null when interval exists', () => {
      const errorDisplay = new ErrorDisplay()
      const app = new TabletKioskApp(errorDisplay)

      // Set up an interval
      const intervalId = 123
      ;(app as any).weatherUpdateInterval = intervalId

      // Spy on clearInterval
      const clearIntervalSpy = vi.spyOn(window, 'clearInterval')

      // Call the method
      ;(app as any).stopWeatherUpdates()

      // Verify interval was cleared
      expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId)
      expect((app as any).weatherUpdateInterval).toBeNull()

      clearIntervalSpy.mockRestore()
    })

    it('does nothing when interval is already null', () => {
      const errorDisplay = new ErrorDisplay()
      const app = new TabletKioskApp(errorDisplay)

      // Ensure interval is null
      ;(app as any).weatherUpdateInterval = null

      // Spy on clearInterval
      const clearIntervalSpy = vi.spyOn(window, 'clearInterval')

      // Call the method
      ;(app as any).stopWeatherUpdates()

      // Verify clearInterval was NOT called
      expect(clearIntervalSpy).not.toHaveBeenCalled()
      expect((app as any).weatherUpdateInterval).toBeNull()

      clearIntervalSpy.mockRestore()
    })
  })
})
