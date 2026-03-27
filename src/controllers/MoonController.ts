/**
 * Moon Controller
 *
 * Manages the moon image update lifecycle.
 * Owns the update interval, fetches moon data, and coordinates MoonView rendering.
 */

import type { MoonView } from '../components/Astronomy/MoonView'
import type { ErrorDisplay } from '../components/ErrorDisplay'
import type { NasaMoonService } from '../services/NasaMoonService'
import { UpdateScheduler } from '../core/UpdateScheduler'

export class MoonController {
  private scheduler: UpdateScheduler
  private lastUpdateFailed = false

  constructor(
    private moonView: MoonView,
    private nasaMoonService: NasaMoonService,
    private errorDisplay: ErrorDisplay,
  ) {
    this.scheduler = new UpdateScheduler(3600000) // 1h
  }

  start(): void {
    this.scheduler.start(async () => {
      try {
        await this.updateViews()
        if (this.lastUpdateFailed) {
          this.lastUpdateFailed = false
          this.errorDisplay.remove('nasa-moon')
        }
      }
      catch (error) {
        this.lastUpdateFailed = true
        this.errorDisplay.show('nasa-moon', error)
      }
    })
  }

  private async updateViews(): Promise<void> {
    const moonImage = await this.nasaMoonService.getCurrentMoonImage()
    this.moonView.render(moonImage.url)
  }

  stop(): void {
    this.scheduler.stop()
  }

  destroy(): void {
    this.stop()
  }
}
