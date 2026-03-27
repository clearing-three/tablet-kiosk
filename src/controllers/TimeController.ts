/**
 * Time Controller
 *
 * Manages the time display update lifecycle.
 * Owns the update interval and coordinates TimeView rendering.
 */

import type { ErrorDisplay } from '../components/ErrorDisplay'
import type { TimeView } from '../components/Time/TimeView'
import { UpdateScheduler } from '../core/UpdateScheduler'

export class TimeController {
  private scheduler: UpdateScheduler
  private lastUpdateFailed = false

  constructor(
    private timeView: TimeView,
    private errorDisplay: ErrorDisplay,
  ) {
    this.scheduler = new UpdateScheduler(1000) // 1s
  }

  start(): void {
    this.scheduler.start(() => {
      try {
        this.updateViews()
        if (this.lastUpdateFailed) {
          this.lastUpdateFailed = false
          this.errorDisplay.remove('clock-update')
        }
      }
      catch (error) {
        this.lastUpdateFailed = true
        this.errorDisplay.show('clock-update', error)
      }
    })
  }

  private updateViews(): void {
    this.timeView.render()
  }

  stop(): void {
    this.scheduler.stop()
  }

  destroy(): void {
    this.stop()
  }

  updateDisplay(): void {
    this.timeView.render()
  }
}
