import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Root } from '../../src/elements/root'

mockChildren()

// Force module evaluation to ensure @customElement decorator runs
void Root

describe('root', () => {
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

  describe('error handling', () => {
    it('should call diagnostic.showError when error-occurred event is dispatched', async () => {
      // given
      document.body.appendChild(element)
      await element.updateComplete

      const diagnostic = element.shadowRoot?.querySelector('x-diagnostic')
      const showErrorSpy = vi.fn()
      if (diagnostic) {
        (diagnostic as any).showError = showErrorSpy
      }

      const errorDetail = {
        source: 'test-component',
        error: new Error('Test error message'),
        timestamp: new Date(),
      }

      // when
      const event = new CustomEvent('error-occurred', {
        detail: errorDetail,
        bubbles: true,
        composed: true,
      })
      element.dispatchEvent(event)

      // then
      expect(showErrorSpy).toHaveBeenCalledWith(errorDetail)
      expect(showErrorSpy).toHaveBeenCalledOnce()
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

  vi.mock('../../src/elements/diagnostic', () => {
    return {}
  })
}
