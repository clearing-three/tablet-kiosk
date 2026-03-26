import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { NasaMoonService } from '../services/NasaMoonService.js'

export const SIXTY_MINUTES_MILLIS = 3600000

@customElement('moon-phase')
export class MoonPhase extends LitElement {
  static styles = css`
    :host {
      display: block;
      text-align: center;
      align-self: flex-end;
    }

    .moon-phase-render {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
    }

    .moon {
      max-width: 43.2vw;
      max-height: 43.2vh;
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

  connectedCallback() {
    super.connectedCallback()
    this.updateMoon()
    this._timer = setInterval(() => this.updateMoon(), SIXTY_MINUTES_MILLIS)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this._timer) {
      clearInterval(this._timer)
    }
  }

  private async updateMoon() {
    const moonImage = await this._moonService.getCurrentMoonImage()
    this._moonImageUrl = moonImage.url
    this._moonImageAlt = moonImage.alt_text
  }

  render() {
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
