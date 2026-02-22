/**
 * MoonPhase Component Tests (3.5.4)
 *
 * Tests for MoonPhase component covering:
 * - SVG container updates
 * - Phase name display updates
 */

import type { Mocked } from 'vitest'
import { MoonPhase } from '../../src/components/Astronomy/MoonPhase'
import { MoonPhaseService } from '../../src/services/MoonPhaseService'

type MockMoonPhaseService = Mocked<
  Pick<
    MoonPhaseService,
    'getPhaseNameLegacy' | 'isLibraryAvailable' | 'updateMoonPhaseDisplay'
  >
>

describe('MoonPhase', () => {
  let moonPhase: MoonPhase
  let mockService: MockMoonPhaseService

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="moon"></div>
      <div id="moon-phase-name"></div>
    `

    mockService = {
      getPhaseNameLegacy: vi.fn().mockReturnValue('Full Moon'),
      isLibraryAvailable: vi.fn().mockReturnValue(true),
      updateMoonPhaseDisplay: vi.fn(),
    }

    moonPhase = new MoonPhase(mockService as unknown as MoonPhaseService)
  })

  describe('constructor', () => {
    it('should throw when required DOM elements are missing', () => {
      document.body.innerHTML = ''

      expect(
        () => new MoonPhase(mockService as unknown as MoonPhaseService)
      ).toThrow('Required DOM element not found')
    })

    it('should throw indicating which element is missing', () => {
      document.body.innerHTML = '<div id="moon"></div>'

      expect(
        () => new MoonPhase(mockService as unknown as MoonPhaseService)
      ).toThrow('#moon-phase-name')
    })
  })

  describe('SVG container updates', () => {
    it('should call updateMoonPhaseDisplay with the normalized phase', () => {
      moonPhase.updatePhase(0.5)

      expect(mockService.updateMoonPhaseDisplay).toHaveBeenCalledWith(0.5)
    })

    it('should set viewBox attribute on the moon container', () => {
      moonPhase.updatePhase(0.25)

      expect(document.getElementById('moon')!.getAttribute('viewBox')).toBe(
        '0 0 200 200'
      )
    })

    it('should set preserveAspectRatio attribute on the moon container', () => {
      moonPhase.updatePhase(0.25)

      expect(
        document.getElementById('moon')!.getAttribute('preserveAspectRatio')
      ).toBe('xMidYMid meet')
    })

    it('should show error state when the moon phase library is not available', () => {
      mockService.isLibraryAvailable.mockReturnValue(false)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      moonPhase.updatePhase(0.5)

      expect(document.getElementById('moon-phase-name')!.textContent).toBe(
        'Phase Unknown'
      )
      consoleSpy.mockRestore()
    })

    it('should log an error when the moon phase library is not available', () => {
      mockService.isLibraryAvailable.mockReturnValue(false)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      moonPhase.updatePhase(0.5)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Moon phase library (phase_junk) not available'
      )
      consoleSpy.mockRestore()
    })

    it('should show error state when updateMoonPhaseDisplay throws', () => {
      mockService.updateMoonPhaseDisplay.mockImplementation(() => {
        throw new Error('SVG render failed')
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      moonPhase.updatePhase(0.5)

      expect(document.getElementById('moon-phase-name')!.textContent).toBe(
        'Phase Unknown'
      )
      consoleSpy.mockRestore()
    })

    it('should log an error when updateMoonPhaseDisplay throws', () => {
      const err = new Error('SVG render failed')
      mockService.updateMoonPhaseDisplay.mockImplementation(() => {
        throw err
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      moonPhase.updatePhase(0.5)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error rendering moon phase SVG:',
        err
      )
      consoleSpy.mockRestore()
    })

    it('should place a placeholder SVG in the container during error state', () => {
      mockService.isLibraryAvailable.mockReturnValue(false)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      moonPhase.updatePhase(0.5)

      const moonEl = document.getElementById('moon')!
      expect(moonEl.querySelector('svg')).not.toBeNull()
      consoleSpy.mockRestore()
    })

    it('should clear the moon container before rendering the placeholder SVG', () => {
      document.getElementById('moon')!.innerHTML =
        '<path d="M 50 50 L 150 150" />'
      mockService.isLibraryAvailable.mockReturnValue(false)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      moonPhase.updatePhase(0.5)

      const moonEl = document.getElementById('moon')!
      expect(moonEl.querySelectorAll('path')).toHaveLength(0)
      consoleSpy.mockRestore()
    })
  })

  describe('phase name display updates', () => {
    it('should update the phase name element with the value from the service', () => {
      mockService.getPhaseNameLegacy.mockReturnValue('Waxing Crescent')

      moonPhase.updatePhase(0.15)

      expect(document.getElementById('moon-phase-name')!.textContent).toBe(
        'Waxing Crescent'
      )
    })

    it('should call getPhaseNameLegacy with the normalized phase value', () => {
      moonPhase.updatePhase(0.75)

      expect(mockService.getPhaseNameLegacy).toHaveBeenCalledWith(0.75)
    })

    it('should display "Unknown Phase" when getPhaseNameLegacy throws', () => {
      mockService.getPhaseNameLegacy.mockImplementation(() => {
        throw new Error('calculation error')
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      moonPhase.updatePhase(0.5)

      expect(document.getElementById('moon-phase-name')!.textContent).toBe(
        'Unknown Phase'
      )
      consoleSpy.mockRestore()
    })

    it('should log an error when getPhaseNameLegacy throws', () => {
      const err = new Error('calculation error')
      mockService.getPhaseNameLegacy.mockImplementation(() => {
        throw err
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      moonPhase.updatePhase(0.5)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error updating moon phase name:',
        err
      )
      consoleSpy.mockRestore()
    })

    it('should overwrite the previous phase name on subsequent calls', () => {
      mockService.getPhaseNameLegacy.mockReturnValue('New Moon')
      moonPhase.updatePhase(0.0)

      mockService.getPhaseNameLegacy.mockReturnValue('Full Moon')
      moonPhase.updatePhase(0.5)

      expect(document.getElementById('moon-phase-name')!.textContent).toBe(
        'Full Moon'
      )
    })
  })

  describe('phase value normalization', () => {
    it('should normalize phase values > 1 via modulo before passing to service', () => {
      moonPhase.updatePhase(1.5)

      expect(mockService.getPhaseNameLegacy).toHaveBeenCalledWith(0.5)
      expect(mockService.updateMoonPhaseDisplay).toHaveBeenCalledWith(0.5)
    })

    it('should warn when phase value is outside 0-1 range', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      moonPhase.updatePhase(1.5)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Moon phase value should be between 0 and 1, normalizing...'
      )
      consoleSpy.mockRestore()
    })

    it('should handle phase value of exactly 0', () => {
      moonPhase.updatePhase(0)

      expect(mockService.updateMoonPhaseDisplay).toHaveBeenCalledWith(0)
    })

    it('should handle phase value of exactly 1', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      moonPhase.updatePhase(1)

      // 1 % 1 = 0
      expect(mockService.updateMoonPhaseDisplay).toHaveBeenCalledWith(0)
      consoleSpy.mockRestore()
    })
  })

  describe('phase value validation', () => {
    it('should show error state when phase is NaN', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      moonPhase.updatePhase(NaN)

      expect(document.getElementById('moon-phase-name')!.textContent).toBe(
        'Phase Unknown'
      )
      consoleSpy.mockRestore()
    })

    it('should log an error when phase is NaN', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      moonPhase.updatePhase(NaN)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Moon phase must be a finite number'
      )
      consoleSpy.mockRestore()
    })

    it('should show error state when phase is Infinity', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      moonPhase.updatePhase(Infinity)

      expect(document.getElementById('moon-phase-name')!.textContent).toBe(
        'Phase Unknown'
      )
      consoleSpy.mockRestore()
    })

    it('should show error state when phase is not a number type', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      moonPhase.updatePhase('invalid' as unknown as number)

      expect(document.getElementById('moon-phase-name')!.textContent).toBe(
        'Phase Unknown'
      )
      consoleSpy.mockRestore()
    })

    it('should log an error when phase is not a number type', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      moonPhase.updatePhase('invalid' as unknown as number)

      expect(consoleSpy).toHaveBeenCalledWith('Moon phase must be a number')
      consoleSpy.mockRestore()
    })

    it('should not call service methods when phase is invalid', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      moonPhase.updatePhase(NaN)

      expect(mockService.getPhaseNameLegacy).not.toHaveBeenCalled()
      expect(mockService.updateMoonPhaseDisplay).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('getCurrentPhaseName', () => {
    it('should return empty string before any update', () => {
      expect(moonPhase.getCurrentPhaseName()).toBe('')
    })

    it('should return the current phase name after an update', () => {
      mockService.getPhaseNameLegacy.mockReturnValue('Last Quarter')

      moonPhase.updatePhase(0.75)

      expect(moonPhase.getCurrentPhaseName()).toBe('Last Quarter')
    })

    it('should return "Phase Unknown" after an error state', () => {
      mockService.isLibraryAvailable.mockReturnValue(false)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      moonPhase.updatePhase(0.5)

      expect(moonPhase.getCurrentPhaseName()).toBe('Phase Unknown')
      consoleSpy.mockRestore()
    })

    it('should reflect the most recent update', () => {
      mockService.getPhaseNameLegacy.mockReturnValue('Waning Gibbous')
      moonPhase.updatePhase(0.6)

      mockService.getPhaseNameLegacy.mockReturnValue('Waning Crescent')
      moonPhase.updatePhase(0.85)

      expect(moonPhase.getCurrentPhaseName()).toBe('Waning Crescent')
    })
  })
})
