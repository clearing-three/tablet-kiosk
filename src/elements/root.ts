import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import './clock'
import './moon'
import './weather'

@customElement('x-root')
export class Root extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: row;
      background: var(--black);
      height: 100vh;
    }

    .pane-left {
      width: 45%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-evenly;
      padding: 2vh;
    }

    .pane-right {
      width: 55%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1vh;
      padding: 2vh;
    }
  `

  render() {
    return html`
      <div class="pane-left">
        <x-moon></x-moon>
      </div>
      <div class="pane-right">
        <x-clock></x-clock>
        <x-weather></x-weather>
      </div>
    `
  }
}
