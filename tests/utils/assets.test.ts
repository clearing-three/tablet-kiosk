/**
 * Unit tests for src/utils/assets.ts
 */

import {
  preloadCriticalAssets,
  getWeatherIconUrl,
  validateAssetExists,
  getCriticalAssetUrls,
  reportMissingAssets,
} from '../../src/utils/assets'

describe('preloadCriticalAssets', () => {
  it('appends preload link elements to document.head', () => {
    const before = document.head.querySelectorAll('link[rel="preload"]').length
    preloadCriticalAssets()
    const links = document.head.querySelectorAll('link[rel="preload"]')
    expect(links.length).toBeGreaterThan(before)
  })

  it('sets as="image" on every preload link', () => {
    preloadCriticalAssets()
    const links = document.head.querySelectorAll('link[rel="preload"]')
    links.forEach(link => expect((link as HTMLLinkElement).as).toBe('image'))
  })

  it('includes critical weather icon paths', () => {
    preloadCriticalAssets()
    const hrefs = Array.from(
      document.head.querySelectorAll('link[rel="preload"]')
    ).map(el => el.getAttribute('href'))
    expect(hrefs).toContain('/weather-icons/clear-day.svg')
    expect(hrefs).toContain('/weather-icons/rain.svg')
    expect(hrefs).toContain('/weather-icons/na.svg')
  })

  it('includes astronomy icon paths', () => {
    preloadCriticalAssets()
    const hrefs = Array.from(
      document.head.querySelectorAll('link[rel="preload"]')
    ).map(el => el.getAttribute('href'))
    expect(hrefs).toContain('/weather-icons/sunrise.svg')
    expect(hrefs).toContain('/weather-icons/moonset.svg')
  })
})

describe('getWeatherIconUrl', () => {
  it('returns a non-empty string for a known icon code', () => {
    const url = getWeatherIconUrl('01d')
    expect(typeof url).toBe('string')
    expect(url.length).toBeGreaterThan(0)
  })

  it('returns a fallback for an unknown icon code', () => {
    const url = getWeatherIconUrl('unknown-code')
    expect(typeof url).toBe('string')
    expect(url.length).toBeGreaterThan(0)
  })
})

describe('validateAssetExists', () => {
  it('returns true when fetch responds with ok', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true })
    const result = await validateAssetExists('/weather-icons/clear-day.svg')
    expect(result).toBe(true)
  })

  it('returns false when fetch responds with not ok', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false })
    const result = await validateAssetExists('/weather-icons/missing.svg')
    expect(result).toBe(false)
  })

  it('returns false when fetch throws', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('network error')
    )
    const result = await validateAssetExists('/weather-icons/clear-day.svg')
    expect(result).toBe(false)
  })

  it('calls fetch with HEAD method', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true })
    await validateAssetExists('/some-asset.svg')
    expect(global.fetch).toHaveBeenCalledWith('/some-asset.svg', {
      method: 'HEAD',
    })
  })
})

describe('getCriticalAssetUrls', () => {
  it('returns a non-empty array', () => {
    const urls = getCriticalAssetUrls()
    expect(Array.isArray(urls)).toBe(true)
    expect(urls.length).toBeGreaterThan(0)
  })

  it('includes expected weather icon entries', () => {
    const urls = getCriticalAssetUrls()
    expect(urls).toContain('weather-icons/clear-day.svg')
    expect(urls).toContain('weather-icons/rain.svg')
    expect(urls).toContain('weather-icons/na.svg')
  })

  it('includes astronomy icon entries', () => {
    const urls = getCriticalAssetUrls()
    expect(urls).toContain('weather-icons/sunrise.svg')
    expect(urls).toContain('weather-icons/moonset.svg')
  })
})

describe('reportMissingAssets', () => {
  let warnSpy: jest.SpyInstance

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('warns when there are missing assets', () => {
    reportMissingAssets(['weather-icons/missing.svg'])
    expect(warnSpy).toHaveBeenCalled()
  })

  it('does not warn when the array is empty', () => {
    reportMissingAssets([])
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('includes the missing asset paths in the warning', () => {
    reportMissingAssets(['a.svg', 'b.svg'])
    expect(warnSpy).toHaveBeenCalledWith('Missing assets detected:', [
      'a.svg',
      'b.svg',
    ])
  })
})
