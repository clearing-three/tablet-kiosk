import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import './time-display'
import './moon-phase'

@customElement('app-root')
export class AppRoot extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--black);
      height: 100vh;
      padding: 1rem;
    }
  `

  render() {
    return html`
      <time-display></time-display>
      <moon-phase></moon-phase>
    `
  }
}
