import { ReactiveController, ReactiveControllerHost } from 'lit'

export class PollingController<T> implements ReactiveController {
  data?: T
  private _timer?: ReturnType<typeof setInterval>

  constructor(
    private host: ReactiveControllerHost,
    private fetchFn: () => Promise<T>,
    private intervalMillis: number
  ) {
    host.addController(this)
  }

  async hostConnected() {
    await this._fetch()
    this._timer = setInterval(() => this._fetch(), this.intervalMillis)
  }

  hostDisconnected() {
    clearInterval(this._timer)
  }

  private async _fetch() {
    this.data = await this.fetchFn()
    this.host.requestUpdate()
  }
}
