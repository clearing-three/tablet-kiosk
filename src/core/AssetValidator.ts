import { validateAssetExists } from '../utils/assets'

export class AssetValidator {
  async validateAll(
    assetUrls: string[]
  ): Promise<{ valid: boolean; missing: string[] }> {
    const missing: string[] = []

    const validationPromises = assetUrls.map(async url => {
      const exists = await validateAssetExists(url)
      if (!exists) {
        missing.push(url)
      }
    })

    await Promise.all(validationPromises)

    return { valid: missing.length === 0, missing }
  }
}
