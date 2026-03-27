import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

mockChildren()

import { Root } from '../../src/elements/root'

// Force module evaluation to ensure @customElement decorator runs
void Root

describe('Root', () => {
  let element: Root

  beforeEach(() => {
    element = document.createElement('x-root') as Root
  })

  afterEach(() => {
    if (element.isConnected) {
      element.remove()
    }
  })

  describe('rendering', () => {
    it('should render x-clock and x-moon elements', async () => {
      document.body.appendChild(element)
      await element.updateComplete

      const clock = element.shadowRoot?.querySelector('x-clock')
      const moon = element.shadowRoot?.querySelector('x-moon')
      const weather = element.shadowRoot?.querySelector('x-weather')


      expect(clock).toBeDefined()
      expect(moon).toBeDefined()
      expect(weather).toBeDefined()
    })
  })
})

function mockChildren() {
  vi.mock('../../src/elements/clock', () => {
    return {}
  })

  vi.mock('../../src/elements/moon', () => {
    return {}
  })

  vi.mock('../../src/elements/weather', () => {
    return {}
  })
}
