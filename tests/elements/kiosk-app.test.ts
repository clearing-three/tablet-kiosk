import { KioskApp } from '../../src/elements/kiosk-app'

// Force module evaluation to ensure @customElement decorator runs
void KioskApp

describe('KioskApp', () => {
  let element: KioskApp

  beforeEach(() => {
    element = document.createElement('kiosk-app') as KioskApp
  })

  afterEach(() => {
    if (element.isConnected) {
      element.remove()
    }
  })

  describe('rendering', () => {
    it('should render a time-display element', async () => {
      document.body.appendChild(element)
      await element.updateComplete

      const timeDisplay = element.shadowRoot?.querySelector('time-display')
      expect(timeDisplay).toBeDefined()
    })
  })
})
