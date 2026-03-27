import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { WeatherContext } from '../context/weather-context.js'
import { WeatherService } from '../services/WeatherService.js'
import { ContextProvider } from '@lit/context'
import { weatherServiceConfig } from '../config/environment'

@customElement('x-weather')
export class Weather extends LitElement {
  public static readonly TEN_MINUTES_MILLIS = 10 * 60 * 1000

  static styles = css`
    :host {
      display: block;
    }
  `

  private _timer?: ReturnType<typeof setInterval>
  private _weatherService = new WeatherService(weatherServiceConfig)
  private _provider = new ContextProvider(this, { context: WeatherContext })

  connectedCallback() {
    super.connectedCallback()
    this.updateWeather()
    this._timer = setInterval(
      () => this.updateWeather(),
      Weather.TEN_MINUTES_MILLIS
    )
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this._timer) {
      clearInterval(this._timer)
    }
  }

  private async updateWeather() {
    const weatherData = await this._weatherService.getWeatherData()
    this._provider.setValue(weatherData)
  }

  render() {
    return html``
  }
}
