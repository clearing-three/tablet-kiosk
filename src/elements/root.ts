import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import './clock'
import './moon'

@customElement('x-root')
export class Root extends LitElement {
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
      <x-clock></x-clock>
      <x-moon></x-moon>
    `
  }
}
