import type { WeatherData } from '../types/weather-domain.types'
import { consume } from '@lit/context'
import { css, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { WeatherContext } from '../context/weather-context.js'
import { formatTimeFromUnix } from '../utils/formatters.js'

@customElement('x-sun-times')
export class SunTimes extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 1vh;
      font-size: 3.5vh;
      font-weight: 300;
     font-family: var(--font-family-base);
    }

    .sun-icon {
      width: 5vh;
      height: 5vh;
      display: block;
    }

    .sunrise-time,
    .sunset-time {
      color: var(--color-sun);
    }

    .sunrise-time::before {
      content: '↑';
      color: var(--color-sunrise);
      font-size: 1.15em;
      font-weight: 500;
      margin-right: 0.3em;
    }

    .sunset-time::before {
      content: '↓';
      color: var(--color-sunset);
      font-size: 1.15em;
      font-weight: 500;
      margin-left: 0.3em;
      margin-right: 0.3em;
    }
  `

  @consume({ context: WeatherContext, subscribe: true })
  @state()
  private _weatherData?: WeatherData

  private get sunriseTime(): string {
    return this._weatherData?.astronomy.sunrise
      ? formatTimeFromUnix(this._weatherData.astronomy.sunrise)
      : ''
  }

  private get sunsetTime(): string {
    return this._weatherData?.astronomy.sunset
      ? formatTimeFromUnix(this._weatherData.astronomy.sunset)
      : ''
  }

  render() {
    return html`
      <img
        src="weather-icons/clear-day.svg"
        alt="Sun"
        class="sun-icon"
      />
      <span class="sunrise-time">${this.sunriseTime}</span>
      <span class="sunset-time">${this.sunsetTime}</span>
    `
  }
}
