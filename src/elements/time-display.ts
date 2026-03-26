import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { formatCurrentTime } from '../utils/formatters.js'

@customElement('time-display')
export class Time extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-size: 19.8vh;
      font-weight: 300;
      color: #66b2ff;
    }
  `

  @state()
  private _currentTime = ''

  private _timer?: ReturnType<typeof setInterval>

  connectedCallback() {
    super.connectedCallback()
    this.updateTime()
    this._timer = setInterval(() => this.updateTime(), 1000)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    clearInterval(this._timer)
  }

  private updateTime() {
    this._currentTime = formatCurrentTime()
  }

  render() {
    return html`${this._currentTime}`
  }
}
