import { ErrorDisplay } from '../../src/components/ErrorDisplay'

describe('ErrorDisplay', () => {
  let errorDisplay: ErrorDisplay

  beforeEach(() => {
    errorDisplay = new ErrorDisplay()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('show()', () => {
    it('appends a bar element to the container', () => {
      errorDisplay.show('init', 'something went wrong')

      const container = document.body.firstElementChild!
      expect(container.children).toHaveLength(1)
    })

    it('replaces the existing bar when called twice with the same source', () => {
      errorDisplay.show('init', 'first error')
      errorDisplay.show('init', 'second error')

      const container = document.body.firstElementChild!
      expect(container.children).toHaveLength(1)
    })

    it('produces two independent bars when called with two different sources', () => {
      errorDisplay.show('init', 'init error')
      errorDisplay.show('weather-update', 'weather error')

      const container = document.body.firstElementChild!
      expect(container.children).toHaveLength(2)
    })
  })

  describe('remove()', () => {
    it('removes the bar for the given source', () => {
      errorDisplay.show('init', 'error')
      errorDisplay.remove('init')

      const container = document.body.firstElementChild!
      expect(container.children).toHaveLength(0)
    })

    it('does not affect bars from other sources', () => {
      errorDisplay.show('init', 'init error')
      errorDisplay.show('weather-update', 'weather error')
      errorDisplay.remove('init')

      const container = document.body.firstElementChild!
      expect(container.children).toHaveLength(1)
    })

    it('is a no-op when the source has no active bar', () => {
      expect(() => errorDisplay.remove('init')).not.toThrow()
    })
  })

  describe('bar content', () => {
    it('renders the error message text', () => {
      errorDisplay.show('init', 'test error message')

      expect(document.body.textContent).toContain('test error message')
    })

    it('includes a <pre> element containing the stack trace for Error instances', () => {
      const error = new Error('test error')
      errorDisplay.show('init', error)

      const pre = document.querySelector('pre')
      expect(pre).not.toBeNull()
      expect(pre!.textContent).toBe(error.stack)
    })

    it('omits the <pre> element when the error is a plain string', () => {
      errorDisplay.show('init', 'plain string error')

      expect(document.querySelector('pre')).toBeNull()
    })

    it('hides and shows the <pre> element on successive toggle button clicks', () => {
      const error = new Error('test error')
      errorDisplay.show('init', error)

      const pre = document.querySelector('pre')!
      const toggle = document.querySelector(
        '.error-bar-toggle'
      ) as HTMLButtonElement

      expect(pre.hidden).toBe(true)
      toggle.click()
      expect(pre.hidden).toBe(false)
      toggle.click()
      expect(pre.hidden).toBe(true)
    })

    it('removes the bar from the DOM when the dismiss button is clicked', () => {
      errorDisplay.show('init', 'error')

      const dismiss = document.querySelector(
        '.error-bar-dismiss'
      ) as HTMLButtonElement
      dismiss.click()

      const container = document.body.firstElementChild!
      expect(container.children).toHaveLength(0)
    })
  })
})
