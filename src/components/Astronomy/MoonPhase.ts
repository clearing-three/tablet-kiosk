/**
 * Moon Phase Component
 *
 * Handles moon phase SVG rendering and phase name display management.
 * Integrates with the moon-phase.js library and MoonPhaseService.
 */

import { MoonPhaseService } from '../../services/MoonPhaseService'

export class MoonPhase {
  private moonPhaseService: MoonPhaseService
  private elements: {
    moonContainer?: HTMLElement
    phaseName?: HTMLElement
  } = {}

  constructor(moonPhaseService: MoonPhaseService) {
    this.moonPhaseService = moonPhaseService
    this.initializeElements()
  }

  /**
   * Initialize DOM element references
   */
  private initializeElements(): void {
    this.elements = {
      moonContainer: document.getElementById('moon') as HTMLElement,
      phaseName: document.getElementById('moon-phase-name') as HTMLElement,
    }
  }

  /**
   * Validates moon phase value
   * @param phase Moon phase value to validate
   * @returns boolean True if phase value is valid
   */
  private validatePhaseValue(phase: number): boolean {
    if (typeof phase !== 'number') {
      console.error('Moon phase must be a number')
      return false
    }

    if (isNaN(phase) || !isFinite(phase)) {
      console.error('Moon phase must be a finite number')
      return false
    }

    if (phase < 0 || phase > 1) {
      console.warn('Moon phase value should be between 0 and 1, normalizing...')
    }

    return true
  }

  /**
   * Normalizes moon phase value to 0-1 range
   * @param phase Raw moon phase value
   * @returns number Normalized phase value between 0 and 1
   */
  private normalizePhase(phase: number): number {
    return phase % 1
  }

  /**
   * Updates the moon phase name display
   * @param phase Moon phase value
   */
  private updatePhaseName(phase: number): void {
    const { phaseName } = this.elements
    if (!phaseName) return

    try {
      const name = this.moonPhaseService.getPhaseNameLegacy(phase)
      phaseName.textContent = name
    } catch (error) {
      console.error('Error updating moon phase name:', error)
      phaseName.textContent = 'Unknown Phase'
    }
  }

  /**
   * Updates the moon SVG container attributes
   */
  private updateSVGAttributes(): void {
    const { moonContainer } = this.elements
    if (!moonContainer) return

    moonContainer.setAttribute('viewBox', '0 0 200 200')
    moonContainer.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  }

  /**
   * Renders the moon phase SVG using the moon-phase.js library
   * @param phase Normalized moon phase value
   */
  private renderMoonSVG(phase: number): void {
    if (!this.moonPhaseService.isLibraryAvailable()) {
      console.error('Moon phase library (phase_junk) not available')
      this.showErrorState()
      return
    }

    try {
      // Clear existing SVG and render new one
      this.moonPhaseService.updateMoonPhaseDisplay(phase)
      this.updateSVGAttributes()
    } catch (error) {
      console.error('Error rendering moon phase SVG:', error)
      this.showErrorState()
    }
  }

  /**
   * Updates both the moon phase SVG and name display
   * @param moonPhase Moon phase value from 0 to 1
   */
  updatePhase(moonPhase: number): void {
    try {
      // Validate input
      if (!this.validatePhaseValue(moonPhase)) {
        this.showErrorState()
        return
      }

      // Normalize phase value to 0-1 range
      const normalizedPhase = this.normalizePhase(moonPhase)

      // Update phase name
      this.updatePhaseName(normalizedPhase)

      // Render moon SVG
      this.renderMoonSVG(normalizedPhase)
    } catch (error) {
      console.error('Error updating moon phase display:', error)
      this.showErrorState()
    }
  }

  /**
   * Shows error state for moon phase display
   */
  private showErrorState(): void {
    const { moonContainer, phaseName } = this.elements

    if (phaseName) {
      phaseName.textContent = 'Phase Unknown'
    }

    if (moonContainer) {
      // Clear the container and show a simple placeholder
      moonContainer.innerHTML = ''

      // Create a simple circle as fallback
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('viewBox', '0 0 200 200')
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')

      const circle = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle'
      )
      circle.setAttribute('cx', '100')
      circle.setAttribute('cy', '100')
      circle.setAttribute('r', '80')
      circle.setAttribute('fill', 'none')
      circle.setAttribute('stroke', '#ffffff')
      circle.setAttribute('stroke-width', '2')

      svg.appendChild(circle)
      moonContainer.appendChild(svg)
    }
  }

  /**
   * Refreshes DOM element references (useful if DOM changes)
   */
  refreshElements(): void {
    this.initializeElements()
  }

  /**
   * Gets the current moon phase name from the display
   * @returns string Current phase name or null if not available
   */
  getCurrentPhaseName(): string | null {
    const { phaseName } = this.elements
    return phaseName?.textContent || null
  }

  /**
   * Checks if the moon phase display has been initialized
   * @returns boolean True if display elements are available
   */
  isInitialized(): boolean {
    return !!(this.elements.moonContainer && this.elements.phaseName)
  }

  /**
   * Checks if the moon phase library is available for rendering
   * @returns boolean True if moon-phase.js library is loaded
   */
  isLibraryAvailable(): boolean {
    return this.moonPhaseService.isLibraryAvailable()
  }
}
