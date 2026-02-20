/**
 * Moon Phase Component
 *
 * Handles moon phase SVG rendering and phase name display management.
 * Integrates with the moon-phase.js library and MoonPhaseService.
 */

import { MoonPhaseService } from '../../services/MoonPhaseService'
import { getElement } from '../../utils/dom'

export class MoonPhase {
  private moonPhaseService: MoonPhaseService
  private elements: {
    moonContainer: HTMLElement
    phaseName: HTMLElement
  }

  constructor(moonPhaseService: MoonPhaseService) {
    this.moonPhaseService = moonPhaseService
    this.elements = this.initializeElements()
  }

  /**
   * Initialize DOM element references. Throws if any required element is missing.
   */
  private initializeElements() {
    return {
      moonContainer: getElement('moon'),
      phaseName: getElement('moon-phase-name'),
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
    try {
      this.elements.phaseName.textContent =
        this.moonPhaseService.getPhaseNameLegacy(phase)
    } catch (error) {
      console.error('Error updating moon phase name:', error)
      this.elements.phaseName.textContent = 'Unknown Phase'
    }
  }

  /**
   * Updates the moon SVG container attributes
   */
  private updateSVGAttributes(): void {
    this.elements.moonContainer.setAttribute('viewBox', '0 0 200 200')
    this.elements.moonContainer.setAttribute(
      'preserveAspectRatio',
      'xMidYMid meet'
    )
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
    if (!this.validatePhaseValue(moonPhase)) {
      this.showErrorState()
      return
    }

    const normalizedPhase = this.normalizePhase(moonPhase)
    this.updatePhaseName(normalizedPhase)
    this.renderMoonSVG(normalizedPhase)
  }

  /**
   * Shows error state for moon phase display
   */
  private showErrorState(): void {
    this.elements.phaseName.textContent = 'Phase Unknown'

    // Clear the container and show a simple placeholder
    this.elements.moonContainer.innerHTML = ''

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
    this.elements.moonContainer.appendChild(svg)
  }

  /**
   * Gets the current moon phase name from the display
   * @returns string Current phase name or null if not available
   */
  getCurrentPhaseName(): string | null {
    return this.elements.phaseName.textContent
  }
}
