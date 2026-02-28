import { AssetValidator } from '../../src/core/AssetValidator'
import * as assets from '../../src/utils/assets'

vi.mock('../../src/utils/assets', async importOriginal => {
  const original = await importOriginal<typeof assets>()
  return { ...original, validateAssetExists: vi.fn() }
})

const mockValidateAssetExists = vi.mocked(assets.validateAssetExists)

describe('AssetValidator', () => {
  let validator: AssetValidator

  beforeEach(() => {
    validator = new AssetValidator()
  })

  describe('validateAll()', () => {
    it('returns valid when all assets exist', async () => {
      mockValidateAssetExists.mockResolvedValue(true)

      const result = await validator.validateAll(['a.svg', 'b.svg'])

      expect(result.valid).toBe(true)
      expect(result.missing).toEqual([])
    })

    it('returns invalid and lists missing assets', async () => {
      mockValidateAssetExists.mockImplementation(url =>
        Promise.resolve(url !== 'missing.svg')
      )

      const result = await validator.validateAll(['ok.svg', 'missing.svg'])

      expect(result.valid).toBe(false)
      expect(result.missing).toEqual(['missing.svg'])
    })

    it('lists all missing assets when none exist', async () => {
      mockValidateAssetExists.mockResolvedValue(false)

      const result = await validator.validateAll(['a.svg', 'b.svg'])

      expect(result.valid).toBe(false)
      expect(result.missing).toEqual(['a.svg', 'b.svg'])
    })

    it('returns valid for an empty url list', async () => {
      const result = await validator.validateAll([])

      expect(result.valid).toBe(true)
      expect(result.missing).toEqual([])
      expect(mockValidateAssetExists).not.toHaveBeenCalled()
    })

    it('calls validateAssetExists for each url', async () => {
      mockValidateAssetExists.mockResolvedValue(true)

      await validator.validateAll(['a.svg', 'b.svg', 'c.svg'])

      expect(mockValidateAssetExists).toHaveBeenCalledTimes(3)
      expect(mockValidateAssetExists).toHaveBeenCalledWith('a.svg')
      expect(mockValidateAssetExists).toHaveBeenCalledWith('b.svg')
      expect(mockValidateAssetExists).toHaveBeenCalledWith('c.svg')
    })
  })
})
