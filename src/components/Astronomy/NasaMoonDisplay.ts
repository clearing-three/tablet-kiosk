/**
 * NASA Moon Display Component
 *
 * Displays NASA Dial-a-Moon API images with hourly updates.
 * Self-contained component that manages its own update interval.
 */

import type { NasaMoonService } from '../../services/NasaMoonService'
import { getElement } from '../../utils/dom'

export class NasaMoonDisplay {
  private element: HTMLImageElement
  private updateInterval: number | null = null
  private readonly updateIntervalMs = 3600000 // 60 minutes

  constructor(private readonly nasaMoonService: NasaMoonService) {
    this.element = this.initializeElements()
  }

  /**
   * Initialize DOM element references. Throws if any required element is missing.
   */
  private initializeElements(): HTMLImageElement {
    return getElement<HTMLImageElement>('moon')
  }

  private setImageSource(url: string): void {
    this.element.src = url
  }

  /**
   * Fetch and display the latest NASA moon image
   */
  private async updateImage(): Promise<void> {
    const moonImage = await this.nasaMoonService.getCurrentMoonImage()
    this.setImageSource(moonImage.url)
  }

  /**
   * Starts the automatic moon image update interval
   */
  startUpdates(
    onError?: (error: unknown) => void,
    onSuccess?: () => void
  ): void {
    this.stopUpdates()

    let lastUpdateFailed = false

    const performUpdate = () => {
      this.updateImage()
        .then(() => {
          if (lastUpdateFailed) {
            lastUpdateFailed = false
            onSuccess?.()
          }
        })
        .catch(error => {
          lastUpdateFailed = true
          onError?.(error)
        })
    }

    performUpdate() // Initial update
    this.updateInterval = window.setInterval(
      performUpdate,
      this.updateIntervalMs
    )
  }

  /**
   * Stops the automatic moon image update interval
   */
  stopUpdates(): void {
    if (this.updateInterval !== null) {
      window.clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  /**
   * Checks if automatic updates are currently running
   */
  isUpdating(): boolean {
    return this.updateInterval !== null
  }

  /**
   * Gets the current update interval in milliseconds
   */
  getUpdateInterval(): number {
    return this.updateIntervalMs
  }

  /**
   * Cleanup method to call when component is being destroyed
   */
  destroy(): void {
    this.stopUpdates()
  }
}
