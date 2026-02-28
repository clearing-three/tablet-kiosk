export type ErrorSource = 'init' | 'weather-update' | 'clock-update'

function getErrorDetails(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error)
    return { message: error.message, stack: error.stack }
  return { message: String(error) }
}

const SOURCE_LABELS: Record<ErrorSource, string> = {
  init: 'Init',
  'weather-update': 'Weather',
  'clock-update': 'Clock',
}

export class ErrorDisplay {
  private container: HTMLElement
  private bars: Map<ErrorSource, HTMLElement> = new Map()

  constructor() {
    this.container = document.createElement('div')
    this.container.className = 'error-display'
    document.body.insertBefore(this.container, document.body.firstChild)
  }

  show(source: ErrorSource, error: unknown): void {
    const { message, stack } = getErrorDetails(error)

    const bar = document.createElement('div')
    bar.className = 'error-bar'

    const summary = document.createElement('div')
    summary.className = 'error-bar-summary'

    const label = document.createElement('span')
    label.className = 'error-bar-label'
    label.textContent = SOURCE_LABELS[source]
    summary.appendChild(label)

    const msg = document.createElement('span')
    msg.className = 'error-bar-message'
    msg.textContent = message
    summary.appendChild(msg)

    let detailEl: HTMLPreElement | undefined
    if (stack) {
      const d = document.createElement('pre')
      d.className = 'error-bar-detail'
      d.textContent = stack
      d.hidden = true

      const toggle = document.createElement('button')
      toggle.className = 'error-bar-toggle'
      toggle.textContent = '▼'
      toggle.addEventListener('click', () => {
        d.hidden = !d.hidden
        toggle.textContent = d.hidden ? '▼' : '▲'
      })
      summary.appendChild(toggle)
      detailEl = d
    }

    const dismiss = document.createElement('button')
    dismiss.className = 'error-bar-dismiss'
    dismiss.textContent = '×'
    dismiss.addEventListener('click', () => this.remove(source))
    summary.appendChild(dismiss)

    bar.appendChild(summary)
    if (detailEl) {
      bar.appendChild(detailEl)
    }

    const existing = this.bars.get(source)
    if (existing) {
      this.container.replaceChild(bar, existing)
    } else {
      this.container.appendChild(bar)
    }
    this.bars.set(source, bar)
  }

  remove(source: ErrorSource): void {
    const bar = this.bars.get(source)
    if (!bar) return
    this.container.removeChild(bar)
    this.bars.delete(source)
  }
}
