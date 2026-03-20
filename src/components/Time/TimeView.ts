/**
 * Time View Component
 */

import { formatCurrentTime, formatCurrentDate } from '../../utils/formatters'
import { getElement } from '../../utils/dom'
import { DOM_IDS } from '../../utils/constants'

export class TimeView {
  private elements: {
    time: HTMLElement
    date: HTMLElement
  }

  constructor() {
    this.elements = this.initializeElements()
  }

  /**
   * Initialize DOM element references. Throws if any required element is missing.
   */
  private initializeElements() {
    return {
      time: getElement(DOM_IDS.TIME),
      date: getElement(DOM_IDS.DATE),
    }
  }

  /**
   * Updates the time display with current time
   */
  private updateTimeDisplay(): void {
    this.elements.time.textContent = formatCurrentTime()
  }

  /**
   * Updates the date display with current date
   */
  private updateDateDisplay(): void {
    this.elements.date.textContent = formatCurrentDate()
  }

  /**
   * Renders both time and date displays
   */
  render(): void {
    this.updateTimeDisplay()
    this.updateDateDisplay()
  }
}
