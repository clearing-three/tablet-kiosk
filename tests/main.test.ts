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
})
