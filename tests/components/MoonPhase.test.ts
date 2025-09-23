/**
 * MoonPhase Component Tests
 *
 * Comprehensive tests for MoonPhase component including:
 * - SVG container updates
 * - Phase name display updates
 * - Integration with MoonPhaseService
 * - Error handling and validation
 */

import { MoonPhase } from '../../src/components/Astronomy/MoonPhase'
import { MoonPhaseService } from '../../src/services/MoonPhaseService'

// Mock DOM elements
const mockElements = {
  moonContainer: document.createElement('div'),
  phaseName: document.createElement('div'),
}

// Mock document.getElementById
const mockGetElementById = jest.fn((id: string): HTMLElement | null => {
  const elementMap: Record<string, HTMLElement> = {
    moon: mockElements.moonContainer,
    'moon-phase-name': mockElements.phaseName,
  }
  return elementMap[id] || null
})

// Mock MoonPhaseService
const mockMoonPhaseService = {
  isLibraryAvailable: jest.fn(() => true),
  updateMoonPhaseDisplay: jest.fn(),
  getPhaseNameLegacy: jest.fn((phase: number) => {
    // Simple mock implementation
    if (phase < 0.125) return 'New Moon'
    if (phase < 0.375) return 'First Quarter'
    if (phase < 0.625) return 'Full Moon'
    if (phase < 0.875) return 'Last Quarter'
    return 'New Moon'
  }),
} as unknown as MoonPhaseService

// Mock document.createElementNS for SVG creation
const mockCreateElementNS = jest.fn(
  (_namespace: string | null, tagName: string) => {
    const element = document.createElement(tagName)
    element.setAttribute = jest.fn()
    element.appendChild = jest.fn()
    return element
  }
)

describe('MoonPhase', () => {
  let moonPhase: MoonPhase

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock document methods
    jest
      .spyOn(document, 'getElementById')
      .mockImplementation(mockGetElementById)
    jest
      .spyOn(document, 'createElementNS')
      .mockImplementation(mockCreateElementNS)

    // Clear element content
    Object.values(mockElements).forEach(element => {
      element.textContent = ''
      element.innerHTML = ''
    })

    // Create MoonPhase instance
    moonPhase = new MoonPhase(mockMoonPhaseService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize DOM element references', () => {
      expect(document.getElementById).toHaveBeenCalledWith('moon')
      expect(document.getElementById).toHaveBeenCalledWith('moon-phase-name')
    })

    it('should handle missing DOM elements gracefully', () => {
      mockGetElementById.mockReturnValue(null)

      expect(() => {
        new MoonPhase(mockMoonPhaseService)
      }).not.toThrow()
    })

    it('should check if initialized correctly', () => {
      expect(moonPhase.isInitialized()).toBe(true)

      // Test with missing elements
      mockGetElementById.mockReturnValue(null)
      const moonPhaseWithMissingElements = new MoonPhase(mockMoonPhaseService)
      expect(moonPhaseWithMissingElements.isInitialized()).toBe(false)
    })
  })

  describe('updatePhase', () => {
    it('should update phase name and render SVG for valid phase', () => {
      const testPhase = 0.25 // First quarter

      moonPhase.updatePhase(testPhase)

      // Check phase name update
      expect(mockMoonPhaseService.getPhaseNameLegacy).toHaveBeenCalledWith(
        testPhase
      )
      expect(mockElements.phaseName.textContent).toBe('First Quarter')

      // Check SVG rendering
      expect(mockMoonPhaseService.updateMoonPhaseDisplay).toHaveBeenCalledWith(
        testPhase
      )
    })

    it('should handle different phase values', () => {
      const testPhases = [
        { phase: 0.0, expectedName: 'New Moon' },
        { phase: 0.25, expectedName: 'First Quarter' },
        { phase: 0.5, expectedName: 'Full Moon' },
        { phase: 0.75, expectedName: 'Last Quarter' },
        { phase: 1.0, expectedName: 'New Moon' },
      ]

      testPhases.forEach(({ phase, expectedName }) => {
        moonPhase.updatePhase(phase)

        expect(mockMoonPhaseService.getPhaseNameLegacy).toHaveBeenCalledWith(
          phase
        )
        expect(mockElements.phaseName.textContent).toBe(expectedName)
      })
    })

    it('should normalize phase values outside 0-1 range', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      // Test phase > 1
      moonPhase.updatePhase(1.25)
      expect(mockMoonPhaseService.getPhaseNameLegacy).toHaveBeenCalledWith(0.25)

      // Test negative phase
      moonPhase.updatePhase(-0.5)
      expect(mockMoonPhaseService.getPhaseNameLegacy).toHaveBeenCalledWith(0.5)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Moon phase value should be between 0 and 1, normalizing...'
      )

      consoleSpy.mockRestore()
    })

    it('should set SVG attributes correctly', () => {
      moonPhase.updatePhase(0.5)

      expect(mockElements.moonContainer.setAttribute).toHaveBeenCalledWith(
        'viewBox',
        '0 0 200 200'
      )
      expect(mockElements.moonContainer.setAttribute).toHaveBeenCalledWith(
        'preserveAspectRatio',
        'xMidYMid meet'
      )
    })

    it('should handle missing DOM elements gracefully', () => {
      mockGetElementById.mockImplementation(
        (id: string): HTMLElement | null => {
          if (id === 'moon-phase-name') return null
          return (
            mockElements[
              id
                .replace('-phase-name', 'Container')
                .replace('moon', 'moonContainer') as keyof typeof mockElements
            ] || null
          )
        }
      )

      moonPhase.refreshElements()

      expect(() => {
        moonPhase.updatePhase(0.5)
      }).not.toThrow()

      // SVG rendering should still work
      expect(mockMoonPhaseService.updateMoonPhaseDisplay).toHaveBeenCalledWith(
        0.5
      )
    })
  })

  describe('phase validation', () => {
    it('should reject non-numeric phase values', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      moonPhase.updatePhase('invalid' as any)

      expect(consoleSpy).toHaveBeenCalledWith('Moon phase must be a number')

      // Should show error state
      expect(mockElements.phaseName.textContent).toBe('Phase Unknown')

      consoleSpy.mockRestore()
    })

    it('should reject NaN values', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      moonPhase.updatePhase(NaN)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Moon phase must be a finite number'
      )

      consoleSpy.mockRestore()
    })

    it('should reject infinite values', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      moonPhase.updatePhase(Infinity)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Moon phase must be a finite number'
      )

      consoleSpy.mockRestore()
    })

    it('should warn about out-of-range values but still process them', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      moonPhase.updatePhase(2.5)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Moon phase value should be between 0 and 1, normalizing...'
      )

      // Should still update with normalized value (2.5 % 1 = 0.5)
      expect(mockMoonPhaseService.getPhaseNameLegacy).toHaveBeenCalledWith(0.5)
      expect(mockElements.phaseName.textContent).toBe('Full Moon')

      consoleSpy.mockRestore()
    })
  })

  describe('library availability handling', () => {
    it('should check if moon phase library is available', () => {
      expect(moonPhase.isLibraryAvailable()).toBe(true)
      expect(mockMoonPhaseService.isLibraryAvailable).toHaveBeenCalled()
    })

    it('should show error state when library is not available', () => {
      mockMoonPhaseService.isLibraryAvailable = jest.fn(() => false)
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      moonPhase.updatePhase(0.5)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Moon phase library (phase_junk) not available'
      )

      // Should show error state
      expect(mockElements.phaseName.textContent).toBe('Phase Unknown')

      consoleSpy.mockRestore()
    })

    it('should handle SVG rendering errors gracefully', () => {
      mockMoonPhaseService.updateMoonPhaseDisplay = jest.fn(() => {
        throw new Error('SVG rendering failed')
      })
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      moonPhase.updatePhase(0.5)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error rendering moon phase SVG:',
        expect.any(Error)
      )

      // Should show error state
      expect(mockElements.phaseName.textContent).toBe('Phase Unknown')

      consoleSpy.mockRestore()
    })
  })

  describe('error state handling', () => {
    it('should show error state for phase name', () => {
      moonPhase['showErrorState']()

      expect(mockElements.phaseName.textContent).toBe('Phase Unknown')
    })

    it('should create fallback SVG when in error state', () => {
      moonPhase['showErrorState']()

      // Should clear container first
      expect(mockElements.moonContainer.innerHTML).toBe('')

      // Should create SVG elements
      expect(document.createElementNS).toHaveBeenCalledWith(
        'http://www.w3.org/2000/svg',
        'svg'
      )
      expect(document.createElementNS).toHaveBeenCalledWith(
        'http://www.w3.org/2000/svg',
        'circle'
      )
    })

    it('should handle error state with missing elements', () => {
      mockGetElementById.mockReturnValue(null)
      const moonPhaseWithMissingElements = new MoonPhase(mockMoonPhaseService)

      expect(() => {
        moonPhaseWithMissingElements['showErrorState']()
      }).not.toThrow()
    })

    it('should handle phase name update errors', () => {
      mockMoonPhaseService.getPhaseNameLegacy = jest.fn(() => {
        throw new Error('Phase name calculation failed')
      })
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      moonPhase.updatePhase(0.5)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error updating moon phase name:',
        expect.any(Error)
      )
      expect(mockElements.phaseName.textContent).toBe('Unknown Phase')

      consoleSpy.mockRestore()
    })
  })

  describe('DOM element management', () => {
    it('should refresh element references when requested', () => {
      const spy = jest.spyOn(document, 'getElementById')
      spy.mockClear()

      moonPhase.refreshElements()

      expect(spy).toHaveBeenCalledWith('moon')
      expect(spy).toHaveBeenCalledWith('moon-phase-name')
    })

    it('should get current phase name from display', () => {
      moonPhase.updatePhase(0.25)

      const currentPhaseName = moonPhase.getCurrentPhaseName()
      expect(currentPhaseName).toBe('First Quarter')
    })

    it('should handle getting phase name with missing element', () => {
      mockGetElementById.mockImplementation(
        (id: string): HTMLElement | null => {
          if (id === 'moon-phase-name') return null
          return mockElements[id as keyof typeof mockElements] || null
        }
      )

      moonPhase.refreshElements()

      const currentPhaseName = moonPhase.getCurrentPhaseName()
      expect(currentPhaseName).toBeNull()
    })
  })

  describe('SVG fallback creation', () => {
    it('should create properly structured fallback SVG', () => {
      moonPhase['showErrorState']()

      // Check SVG creation
      expect(document.createElementNS).toHaveBeenCalledWith(
        'http://www.w3.org/2000/svg',
        'svg'
      )
      expect(document.createElementNS).toHaveBeenCalledWith(
        'http://www.w3.org/2000/svg',
        'circle'
      )

      // Check SVG attributes
      const svgElement = mockCreateElementNS.mock.results[0].value
      expect(svgElement.setAttribute).toHaveBeenCalledWith(
        'viewBox',
        '0 0 200 200'
      )
      expect(svgElement.setAttribute).toHaveBeenCalledWith(
        'preserveAspectRatio',
        'xMidYMid meet'
      )

      // Check circle attributes
      const circleElement = mockCreateElementNS.mock.results[1].value
      expect(circleElement.setAttribute).toHaveBeenCalledWith('cx', '100')
      expect(circleElement.setAttribute).toHaveBeenCalledWith('cy', '100')
      expect(circleElement.setAttribute).toHaveBeenCalledWith('r', '80')
      expect(circleElement.setAttribute).toHaveBeenCalledWith('fill', 'none')
      expect(circleElement.setAttribute).toHaveBeenCalledWith(
        'stroke',
        '#ffffff'
      )
      expect(circleElement.setAttribute).toHaveBeenCalledWith(
        'stroke-width',
        '2'
      )

      // Check element composition
      expect(svgElement.appendChild).toHaveBeenCalledWith(circleElement)
    })
  })

  describe('integration with MoonPhaseService', () => {
    it('should call service methods correctly', () => {
      const testPhase = 0.75

      moonPhase.updatePhase(testPhase)

      expect(mockMoonPhaseService.isLibraryAvailable).toHaveBeenCalled()
      expect(mockMoonPhaseService.getPhaseNameLegacy).toHaveBeenCalledWith(
        testPhase
      )
      expect(mockMoonPhaseService.updateMoonPhaseDisplay).toHaveBeenCalledWith(
        testPhase
      )
    })

    it('should handle service method failures individually', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Test phase name failure
      mockMoonPhaseService.getPhaseNameLegacy = jest.fn(() => {
        throw new Error('Phase name failed')
      })

      moonPhase.updatePhase(0.5)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error updating moon phase name:',
        expect.any(Error)
      )
      expect(mockElements.phaseName.textContent).toBe('Unknown Phase')

      // SVG rendering should still be attempted
      expect(mockMoonPhaseService.updateMoonPhaseDisplay).toHaveBeenCalledWith(
        0.5
      )

      consoleSpy.mockRestore()
    })
  })

  describe('edge cases and boundary conditions', () => {
    it('should handle very small phase values', () => {
      const verySmallPhase = 0.001

      moonPhase.updatePhase(verySmallPhase)

      expect(mockMoonPhaseService.getPhaseNameLegacy).toHaveBeenCalledWith(
        verySmallPhase
      )
      expect(mockMoonPhaseService.updateMoonPhaseDisplay).toHaveBeenCalledWith(
        verySmallPhase
      )
    })

    it('should handle boundary phase values', () => {
      const boundaryPhases = [0, 0.25, 0.5, 0.75, 1.0]

      boundaryPhases.forEach(phase => {
        moonPhase.updatePhase(phase)

        expect(mockMoonPhaseService.getPhaseNameLegacy).toHaveBeenCalledWith(
          phase
        )
        expect(
          mockMoonPhaseService.updateMoonPhaseDisplay
        ).toHaveBeenCalledWith(phase)
      })
    })

    it('should handle rapid successive updates', () => {
      const phases = [0.1, 0.2, 0.3, 0.4, 0.5]

      phases.forEach(phase => {
        moonPhase.updatePhase(phase)
      })

      // Should have called service methods for each phase
      expect(mockMoonPhaseService.getPhaseNameLegacy).toHaveBeenCalledTimes(
        phases.length
      )
      expect(mockMoonPhaseService.updateMoonPhaseDisplay).toHaveBeenCalledTimes(
        phases.length
      )

      // Last phase should be displayed
      expect(mockMoonPhaseService.getPhaseNameLegacy).toHaveBeenLastCalledWith(
        0.5
      )
    })
  })
})
