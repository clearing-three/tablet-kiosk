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

    it('should throw when the moon phase library is not available', () => {
      mockService.isLibraryAvailable.mockReturnValue(false)

      expect(() => moonPhase.updatePhase(0.5)).toThrow(
        'Moon phase library (phase_junk) not available'
      )
    })

    it('should propagate errors from updateMoonPhaseDisplay', () => {
      const thrownError = new Error('SVG render failed')
      mockService.updateMoonPhaseDisplay.mockImplementation(() => {
        throw thrownError
      })

      expect(() => moonPhase.updatePhase(0.5)).toThrow(thrownError)
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

    it('should propagate errors from getPhaseNameLegacy', () => {
      const thrownError = new Error('calculation error')
      mockService.getPhaseNameLegacy.mockImplementation(() => {
        throw thrownError
      })

      expect(() => moonPhase.updatePhase(0.5)).toThrow(thrownError)
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
    it('should throw with a descriptive message when phase is NaN', () => {
      expect(() => moonPhase.updatePhase(NaN)).toThrow(
        'Moon phase must be a finite number'
      )
    })

    it('should throw with a descriptive message when phase is Infinity', () => {
      expect(() => moonPhase.updatePhase(Infinity)).toThrow(
        'Moon phase must be a finite number'
      )
    })

    it('should throw with a descriptive message when phase is not a number type', () => {
      expect(() =>
        moonPhase.updatePhase('invalid' as unknown as number)
      ).toThrow('Moon phase must be a number')
    })

    it('should not call service methods when phase is invalid', () => {
      expect(() => moonPhase.updatePhase(NaN)).toThrow()

      expect(mockService.getPhaseNameLegacy).not.toHaveBeenCalled()
      expect(mockService.updateMoonPhaseDisplay).not.toHaveBeenCalled()
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

    it('should reflect the most recent update', () => {
      mockService.getPhaseNameLegacy.mockReturnValue('Waning Gibbous')
      moonPhase.updatePhase(0.6)

      mockService.getPhaseNameLegacy.mockReturnValue('Waning Crescent')
      moonPhase.updatePhase(0.85)

      expect(moonPhase.getCurrentPhaseName()).toBe('Waning Crescent')
    })
  })
})
