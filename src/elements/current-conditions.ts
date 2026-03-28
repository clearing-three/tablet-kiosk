import type { WeatherData } from '../types/weather-domain.types'
import { consume } from '@lit/context'
import { css, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { WeatherContext } from '../context/weather-context.js'
import { formatTemperature } from '../utils/formatters.js'

export const WIND_ICON_PATH = 'weather-icons/wind-static.svg'

@customElement('x-current-conditions')
export class CurrentConditions extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      margin: auto 0;
      font-family: var(--font-family-base);
      align-items: center;
    }

    .temp {
      display: flex;
      align-items: center;
      gap: 1.8vh;
    }

    .temp-now {
      font-size: 10vh;
      font-weight: 500;
      color: var(--color-text-tertiary);
    }

    .feels-like-display {
      display: flex;
      align-items: center;
      gap: 1.2vh;
      font-size: 5.5vh;
    }

    .feels-like-display::before {
      content: '';
      display: block;
      width: 0.15vh;
      height: 2em;
      background-color: var(--color-feels-like);
      opacity: 0.5;
    }

    .feels-like {
      font-weight: 300;
      color: var(--color-feels-like);
    }

    .feels-like::before {
      content: '';
      display: inline-block;
      width: 0.85em;
      height: 0.85em;
      margin-right: 0.4em;
      background-color: var(--color-feels-like);
      mask: var(--person-icon-svg) center/contain no-repeat;
      vertical-align: -0.1em;
    }

    .wind-display {
      display: flex;
      align-items: center;
      gap: 0.6vh;
    }

    .wind-icon {
      width: 7.2vh;
      height: 7.2vh;
      display: block;
    }

    .wind-direction {
      font-size: 4.8vh;
      font-weight: 300;
      letter-spacing: 0.05em;
      color: var(--color-text-primary);
    }

    .wind-speed {
      font-size: 4.2vh;
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    .wind-speed::after {
      content: ' mph';
      font-size: 0.8em;
      font-weight: 300;
    }

    .wind-gust::before {
      content: '';
      display: inline-block;
      width: 1em;
      height: 1em;
      margin: 0 0.3em;
      background-color: currentcolor;
      vertical-align: -0.15em;
      mask: var(--arrow-right-svg) center/contain no-repeat;
    }

    .wind-gust {
      color: var(--color-text-secondary);
    }

    .temperature::after {
      content: '°';
    }

    .weather-range {
      font-size: 4.5vh;
      opacity: 0.9;
    }

    .temp-high::before {
      content: '↑';
    }

    .temp-high {
      color: var(--color-temp-high);
    }

    .temp-low::before {
      content: '↓';
    }

    .temp-low {
      color: var(--color-temp-low);
    }
  `

  @consume({ context: WeatherContext, subscribe: true })
  @state()
  private _weatherData?: WeatherData

  private get temperature(): string {
    return this._weatherData?.current.temperature
      ? formatTemperature(this._weatherData.current.temperature)
      : ''
  }

  private get feelsLike(): string {
    return this._weatherData?.current.feelsLike
      ? formatTemperature(this._weatherData.current.feelsLike)
      : ''
  }

  private get windSpeed(): number {
    return this._weatherData?.current.windSpeed ?? 0
  }

  private get windDirection(): string {
    return this._weatherData?.current.windDirection ?? ''
  }

  private get windGust(): number | undefined {
    return this._weatherData?.current.windGust
  }

  private get maxTemp(): string {
    return this._weatherData?.current.maxTemp
      ? formatTemperature(this._weatherData.current.maxTemp)
      : ''
  }

  private get minTemp(): string {
    return this._weatherData?.current.minTemp
      ? formatTemperature(this._weatherData.current.minTemp)
      : ''
  }

  override render() {
    return html`
      <div class="temp">
        <div class="temp-now temperature">${this.temperature}</div>
        <div class="feels-like-display">
          <span class="feels-like temperature">${this.feelsLike}</span>
        </div>
      </div>
      <div class="wind-display">
        <img
          src="${WIND_ICON_PATH}"
          alt="Wind"
          class="wind-icon"
        />
        <span class="wind-direction">${this.windDirection}</span>
        <div class="wind-speed">
          ${this.windSpeed}${this.windGust !== undefined
            ? html`<span class="wind-gust">${this.windGust}</span>`
            : ''}
        </div>
      </div>
      <div class="weather-range">
        <span class="temp-high temperature">${this.maxTemp}</span>
        <span class="temp-low temperature">${this.minTemp}</span>
      </div>
    `
  }
}
