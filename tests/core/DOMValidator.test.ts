import { DOMValidator } from '../../src/core/DOMValidator'

describe('dOMValidator', () => {
  let validator: DOMValidator

  beforeEach(() => {
    validator = new DOMValidator()
  })

  describe('validate()', () => {
    it('returns valid when all elements exist', () => {
      document.body.innerHTML = '<div id="a"></div><div id="b"></div>'

      const result = validator.validate(['a', 'b'])

      expect(result.valid).toBe(true)
      expect(result.missing).toEqual([])
    })

    it('returns invalid when an element is missing', () => {
      document.body.innerHTML = '<div id="a"></div>'

      const result = validator.validate(['a', 'missing'])

      expect(result.valid).toBe(false)
      expect(result.missing).toEqual(['missing'])
    })

    it('lists all missing elements', () => {
      document.body.innerHTML = ''

      const result = validator.validate(['x', 'y', 'z'])

      expect(result.valid).toBe(false)
      expect(result.missing).toEqual(['x', 'y', 'z'])
    })

    it('returns valid for an empty id list', () => {
      const result = validator.validate([])

      expect(result.valid).toBe(true)
      expect(result.missing).toEqual([])
    })
  })
})
