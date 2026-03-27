import { ContextProvider } from '@lit/context'
import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { weatherServiceConfig } from '../config/environment'
import { WeatherContext } from '../context/weather-context.js'
import { WeatherService } from '../services/WeatherService.js'
import './sun-times.js'

@customElement('x-weather')
export class Weather extends LitElement {
  public static readonly TEN_MINUTES_MILLIS = 10 * 60 * 1000

  static override styles = css`
    :host {
      display: block;
    }
  `

  private _timer?: ReturnType<typeof setInterval>
  private _weatherService = new WeatherService(weatherServiceConfig)
  private _provider = new ContextProvider(this, { context: WeatherContext })

  override connectedCallback() {
    super.connectedCallback?.()
    this.updateWeather()
    this._timer = setInterval(
      () => this.updateWeather(),
      Weather.TEN_MINUTES_MILLIS,
    )
  }

  override disconnectedCallback() {
    super.disconnectedCallback?.()
    if (this._timer) {
      clearInterval(this._timer)
    }
  }

  private async updateWeather() {
    const weatherData = await this._weatherService.getWeatherData()
    this._provider.setValue(weatherData)
  }

  override render() {
    return html`<x-sun-times></x-sun-times>`
  }
}
