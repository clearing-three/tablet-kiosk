import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

mockChildren()

import { AppRoot } from '../../src/elements/app-root'

// Force module evaluation to ensure @customElement decorator runs
void AppRoot

describe('AppRoot', () => {
  let element: AppRoot

  beforeEach(() => {
    element = document.createElement('app-root') as AppRoot
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
