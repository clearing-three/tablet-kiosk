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
  private validatePhaseValue(phase: number): void {
    if (typeof phase !== 'number') {
      throw new Error('Moon phase must be a number')
    }

    if (isNaN(phase) || !isFinite(phase)) {
      throw new Error('Moon phase must be a finite number')
    }

    if (phase < 0 || phase > 1) {
      console.warn('Moon phase value should be between 0 and 1, normalizing...')
    }
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
    this.elements.phaseName.textContent =
      this.moonPhaseService.getPhaseNameLegacy(phase)
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
      throw new Error('Moon phase library (phase_junk) not available')
    }

    this.moonPhaseService.updateMoonPhaseDisplay(phase)
    this.updateSVGAttributes()
  }

  /**
   * Updates both the moon phase SVG and name display
   * @param moonPhase Moon phase value from 0 to 1
   */
  updatePhase(moonPhase: number): void {
    this.validatePhaseValue(moonPhase)
    const normalizedPhase = this.normalizePhase(moonPhase)
    this.updatePhaseName(normalizedPhase)
    this.renderMoonSVG(normalizedPhase)
  }

  /**
   * Gets the current moon phase name from the display
   * @returns string Current phase name or null if not available
   */
  getCurrentPhaseName(): string | null {
    return this.elements.phaseName.textContent
  }
}
