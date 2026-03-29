import { css, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { NasaMoonService } from '../services/nasa-moon-service.js'

export const SIXTY_MINUTES_MILLIS = 3600000

@customElement('x-moon')
export class Moon extends LitElement {
  static override styles = css`
    :host {
      display: block;
      text-align: center;
    }

    .moon-phase-render {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
    }

    .moon {
      max-width: 50vw;
      max-height: 50vh;
      width: auto;
      height: auto;
      display: block;
      object-fit: contain;
      transform: scale(1.6);
      -webkit-user-drag: none;
    }
  `

  @state()
  private _moonImageUrl = ''

  @state()
  private _moonImageAlt = 'Current moon phase'

  private _timer?: ReturnType<typeof setInterval>
  private _moonService = new NasaMoonService()

  override connectedCallback() {
    super.connectedCallback?.()
    this.updateMoon()
    this._timer = setInterval(() => this.updateMoon(), SIXTY_MINUTES_MILLIS)
  }

  override disconnectedCallback() {
    super.disconnectedCallback?.()
    if (this._timer) {
      clearInterval(this._timer)
    }
  }

  private async updateMoon() {
    try {
      const moonImage = await this._moonService.getCurrentMoonImage()
      this._moonImageUrl = moonImage.url
      this._moonImageAlt = moonImage.alt_text
    }
    catch (error) {
      this.dispatchEvent(
        new CustomEvent('error-occurred', {
          bubbles: true,
          composed: true,
          detail: {
            source: 'Nasa Moon',
            error,
            timestamp: new Date(),
          },
        }),
      )
    }
  }

  override render() {
    return html`
      <div class="moon-phase-render">
        <img
          class="moon"
          src="${this._moonImageUrl}"
          alt="${this._moonImageAlt}"
        />
      </div>
    `
  }
}
