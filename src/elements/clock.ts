import { css, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { formatCurrentDate, formatCurrentTime } from '../utils/formatters.js'

@customElement('x-clock')
export class Clock extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-family: var(--font-family-base);
    }

    .time {
      font-size: 20vh;
      font-weight: 300;
      color: var(--color-text-primary);
    }

    .date {
      font-size: 5vh;
      font-weight: 300;
      color: var(--color-text-secondary);
    }
  `

  @state()
  private _currentTime = ''

  @state()
  private _currentDate = ''

  private _timer?: ReturnType<typeof setInterval>

  connectedCallback() {
    super.connectedCallback?.()
    this.updateTime()
    this._timer = setInterval(() => this.updateTime(), 1000)
  }

  disconnectedCallback() {
    super.disconnectedCallback?.()
    clearInterval(this._timer)
  }

  private updateTime() {
    this._currentTime = formatCurrentTime()
    this._currentDate = formatCurrentDate()
  }

  render() {
    return html`
      <div class="time">${this._currentTime}</div>
      <div class="date">${this._currentDate}</div>
    `
  }
}
