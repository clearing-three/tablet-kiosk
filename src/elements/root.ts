import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import './clock'
import './moon'
import './weather'

@customElement('x-root')
export class Root extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: row;
      background: var(--black);
      height: 100vh;
    }

    .pane-left {
      width: 60%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-evenly;
      padding: 2vh;
      padding-left: 4vw;
    }

    .pane-right {
      width: 40%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1vh;
      padding: 2vh;
      padding-right: 8vw;
    }
  `

  override render() {
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
