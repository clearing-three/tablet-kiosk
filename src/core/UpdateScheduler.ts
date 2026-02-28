export class UpdateScheduler {
  private intervalId: number | null = null

  constructor(private readonly intervalMs: number) {}

  start(callback: () => void | Promise<void>): void {
    this.stop()
    callback()
    this.intervalId = window.setInterval(callback, this.intervalMs)
  }

  stop(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  isRunning(): boolean {
    return this.intervalId !== null
  }
}
