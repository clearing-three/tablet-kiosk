import type { Diagnostic, ErrorDetail } from './diagnostic.js'
import { css, html, LitElement } from 'lit'
import { customElement, query } from 'lit/decorators.js'
import './clock'
import './diagnostic'
import './weather'

@customElement('x-root')
export class Root extends LitElement {
  @query('x-diagnostic')
  private _diagnostic!: Diagnostic

  static override styles = css`
    :host {
      display: flex;
      flex-direction: row;
      background: var(--black);
      height: 100vh;
    }

    .main {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1vh;
      padding: 2vh 4vw;
    }
  `

  override connectedCallback() {
    super.connectedCallback?.()
    this.addEventListener('error-occurred', this._handleError)
  }

  override disconnectedCallback() {
    super.disconnectedCallback?.()
    this.removeEventListener('error-occurred', this._handleError)
  }

  private _handleError = (event: Event) => {
    const customEvent = event as CustomEvent<ErrorDetail>
    this._diagnostic.showError(customEvent.detail)
  }

  override render() {
    return html`
      <x-diagnostic hidden></x-diagnostic>
      <div class="main">
        <x-clock></x-clock>
        <x-weather></x-weather>
      </div>
    `
  }
}
