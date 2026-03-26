import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import './time-display'

@customElement('kiosk-app')
export class KioskApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: black;
      color: #00bfff;
      min-height: 100vh;
      padding: 1rem;
    }
  `

  render() {
    return html`<time-display></time-display>`
  }
}
