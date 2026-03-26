import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

mockChildren()

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
    it('should render time-display and moon-phase elements', async () => {
      document.body.appendChild(element)
      await element.updateComplete

      const timeDisplay = element.shadowRoot?.querySelector('time-display')
      const moonPhase = element.shadowRoot?.querySelector('moon-phase')

      expect(timeDisplay).toBeDefined()
      expect(moonPhase).toBeDefined()
    })
  })
})

function mockChildren() {
  vi.mock('../../src/elements/time-display', () => {
    return {}
  })

  vi.mock('../../src/elements/moon-phase', () => {
    return {}
  })
}
