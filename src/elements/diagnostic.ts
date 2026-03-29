import { css, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'

export interface ErrorDetail {
  source: string
  error: unknown
  timestamp: Date
}

@customElement('x-diagnostic')
export class Diagnostic extends LitElement {
  private static readonly LOCALE = 'en-US'

  static override styles = css`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 100;
      display: flex;
      flex-direction: column;
    }

    :host([hidden]) {
      display: none;
    }

    .error-bar {
      width: 100%;
      background: var(--color-error-bg);
      color: var(--color-error-text);
      font-family: Roboto, sans-serif;
      font-size: 1rem;
    }

    .error-bar-summary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 0.75rem;
      min-height: 44px;
    }

    .error-bar-timestamp {
      font-family: monospace;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .error-bar-label {
      font-weight: 700;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .error-bar-message {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .error-bar-toggle,
    .error-bar-dismiss {
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      background: transparent;
      border: none;
      color: var(--color-error-text);
      font-size: 1.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    .error-bar-toggle:hover,
    .error-bar-dismiss:hover {
      background: var(--color-error-hover);
    }

    .error-bar-detail {
      margin: 0;
      padding: 0.5rem 0.75rem;
      font-family: monospace;
      font-size: 0.85rem;
      white-space: pre-wrap;
      word-break: break-all;
      overflow-y: auto;
      max-height: 30vh;
      background: var(--color-error-detail-bg);
      color: var(--color-error-detail-text);
    }

    .error-bar-detail[hidden] {
      display: none;
    }
  `

  @state()
  private _errorDetail: ErrorDetail | null = null

  @state()
  private _showStack = false

  showError(detail: ErrorDetail) {
    this._errorDetail = detail
    this._showStack = false
    this.removeAttribute('hidden')
  }

  private _dismiss() {
    this._errorDetail = null
    this._showStack = false
    this.setAttribute('hidden', '')
  }

  private _toggleStack() {
    this._showStack = !this._showStack
  }

  private _getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    return String(error)
  }

  private _getErrorStack(error: unknown): string | undefined {
    if (error instanceof Error && error.stack) {
      return error.stack
    }
    return undefined
  }

  override render() {
    if (!this._errorDetail) {
      return html``
    }

    const message = this._getErrorMessage(this._errorDetail.error)
    const stack = this._getErrorStack(this._errorDetail.error)

    return html`
      <div class="error-bar">
        <div class="error-bar-summary">
          <span class="error-bar-timestamp">${this._errorDetail.timestamp.toLocaleString(Diagnostic.LOCALE, { hour12: false })}</span>
          <span class="error-bar-label">| ${this._errorDetail.source} |</span>
          <span class="error-bar-message">${message}</span>
          ${stack
            ? html`
                <button
                  class="error-bar-toggle"
                  @click=${this._toggleStack}
                  aria-label="Toggle stack trace"
                >
                  ${this._showStack ? '▲' : '▼'}
                </button>
              `
            : null}
          <button
            class="error-bar-dismiss"
            @click=${this._dismiss}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
        ${stack
          ? html`
              <pre class="error-bar-detail" ?hidden=${!this._showStack}>
${stack}</pre
              >
            `
          : null}
      </div>
    `
  }
}
