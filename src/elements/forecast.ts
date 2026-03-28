import type { WeatherData } from '../types/weather-domain.types'
import { consume } from '@lit/context'
import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { WeatherContext } from '../context/weather-context.js'
import { formatTemperature } from '../utils/formatters.js'

type ForecastDay = WeatherData['forecast'][0]

@customElement('x-forecast')
export class Forecast extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      justify-content: center;
      gap: 15vh;
      width: 100%;
      font-family: var(--font-family-base);
    }

    .forecast-day {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 3vh;
      opacity: 0.95;
      text-align: center;
    }

    .forecast-day .forecast-icon {
      width: 8vh;
      height: 8vh;
      margin-bottom: 0.6vh;
      pointer-events: none;
    }

    .forecast-range {
      color: var(--color-text-tertiary);
      font-size: 3vh;
    }

    .forecast-day-name {
      font-weight: 700;
      color: var(--color-text-secondary);
    }

    .temperature::after {
      content: '°';
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

  @property({ type: Number })
  days = 2

  @consume({ context: WeatherContext, subscribe: true })
  @state()
  private _weatherData?: WeatherData

  private get forecastDays(): ForecastDay[] {
    if (!this._weatherData?.forecast) {
      return []
    }
    return this._weatherData.forecast.slice(0, this.days)
  }

  private renderForecastDay(day: ForecastDay) {
    return html`
      <div class="forecast-day">
        <div class="forecast-day-name">${day.dayName}</div>
        <object
          type="image/svg+xml"
          class="forecast-icon"
          data="weather-icons/${day.icon}.svg"
        ></object>
        <div class="forecast-range">
          <span class="temp-high temperature">${formatTemperature(day.maxTemp)}</span>
          ${' '}
          <span class="temp-low temperature">${formatTemperature(day.minTemp)}</span>
        </div>
      </div>
    `
  }

  override render() {
    return this.forecastDays.map(day => this.renderForecastDay(day))
  }
}
