/**
 * MoonView Component Tests
 *
 * Tests for MoonView component covering:
 * - Passive rendering of moon image
 * - DOM element initialization
 */

import { MoonView } from '../../src/components/Astronomy/MoonView'

describe('MoonView', () => {
  let moonView: MoonView

  beforeEach(() => {
    document.body.innerHTML = `
      <img id="moon" alt="Current moon phase" />
    `
    moonView = new MoonView()
  })

  describe('constructor', () => {
    it('should throw when required DOM element is missing', () => {
      document.body.innerHTML = ''

      expect(() => new MoonView()).toThrow('Required DOM element not found')
    })

    it('should throw indicating which element is missing', () => {
      document.body.innerHTML = '<div></div>'

      expect(() => new MoonView()).toThrow('#moon')
    })

    it('should initialize successfully with moon element present', () => {
      expect(() => moonView).not.toThrow()
    })
  })

  describe('render()', () => {
    it('should set the image src to the provided URL', () => {
      const testUrl = 'https://svs.gsfc.nasa.gov/moon.jpg'

      moonView.render(testUrl)

      const moonElement = document.getElementById('moon') as HTMLImageElement
      expect(moonElement.src).toBe(testUrl)
    })

    it('should update the image src when called multiple times', () => {
      const firstUrl = 'https://svs.gsfc.nasa.gov/moon1.jpg'
      const secondUrl = 'https://svs.gsfc.nasa.gov/moon2.jpg'

      moonView.render(firstUrl)
      const moonElement = document.getElementById('moon') as HTMLImageElement
      expect(moonElement.src).toBe(firstUrl)

      moonView.render(secondUrl)
      expect(moonElement.src).toBe(secondUrl)
    })
  })
})
