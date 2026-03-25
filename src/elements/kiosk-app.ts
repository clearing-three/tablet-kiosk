import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('kiosk-app')
export class KioskApp extends LitElement {
  render() {
    return html`<div>hello, world</div>`
  }
}
