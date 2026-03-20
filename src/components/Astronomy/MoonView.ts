/**
 * Moon View Component
 *
 * Renders NASA Dial-a-Moon API images.
 */

import { getElement } from '../../utils/dom'
import { DOM_IDS } from '../../utils/constants'

export class MoonView {
  private element: HTMLImageElement

  constructor() {
    this.element = this.initializeElements()
  }

  /**
   * Initialize DOM element references. Throws if any required element is missing.
   */
  private initializeElements(): HTMLImageElement {
    return getElement<HTMLImageElement>(DOM_IDS.MOON)
  }

  /**
   * Renders the moon image with the provided URL
   */
  render(url: string): void {
    this.element.src = url
  }
}
