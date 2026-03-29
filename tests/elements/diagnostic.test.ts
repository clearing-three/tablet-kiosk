import type { ErrorDetail } from '../../src/elements/diagnostic'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Diagnostic } from '../../src/elements/diagnostic'

void Diagnostic

describe('diagnostic', () => {
  let element: Diagnostic

  beforeEach(() => {
    element = document.createElement('x-diagnostic') as Diagnostic
    document.body.appendChild(element)
  })

  afterEach(() => {
    if (element.isConnected) {
      element.remove()
    }
  })

  describe('initialization', () => {
    it('should not render error bar when no error is present', async () => {
      await element.updateComplete

      const errorBar = element.shadowRoot?.querySelector('.error-bar')
      expect(errorBar).toBeNull()
    })
  })

  describe('showError', () => {
    it('should display error with message, source, and timestamp', async () => {
      // given
      const errorDetail: ErrorDetail = {
        source: 'TestSource',
        error: new Error('Test error message'),
        timestamp: new Date('2026-03-28T10:30:00'),
      }

      // when
      element.showError(errorDetail)
      await element.updateComplete

      // then
      const errorBar = element.shadowRoot?.querySelector('.error-bar')
      const message = element.shadowRoot?.querySelector('.error-bar-message')
      const source = element.shadowRoot?.querySelector('.error-bar-label')
      const timestamp = element.shadowRoot?.querySelector('.error-bar-timestamp')

      expect(errorBar).toBeDefined()
      expect(message?.textContent).toBe('Test error message')
      expect(source?.textContent).toBe('| TestSource |')
      expect(timestamp?.textContent).toContain('2026')
    })

    it('should remove hidden attribute when showing error', async () => {
      // given
      const errorDetail: ErrorDetail = {
        source: 'TestSource',
        error: new Error('Test error'),
        timestamp: new Date(),
      }
      element.setAttribute('hidden', '')

      // when
      element.showError(errorDetail)
      await element.updateComplete

      // then
      expect(element.hasAttribute('hidden')).toBe(false)
    })

    it('should reset stack trace visibility when showing new error', async () => {
      // given
      const firstError: ErrorDetail = {
        source: 'FirstSource',
        error: new Error('First error'),
        timestamp: new Date(),
      }
      element.showError(firstError)
      await element.updateComplete

      const toggleButton = element.shadowRoot?.querySelector('.error-bar-toggle') as HTMLButtonElement
      toggleButton?.click()
      await element.updateComplete

      // when
      const secondError: ErrorDetail = {
        source: 'SecondSource',
        error: new Error('Second error'),
        timestamp: new Date(),
      }
      element.showError(secondError)
      await element.updateComplete

      // then
      const stackDetail = element.shadowRoot?.querySelector('.error-bar-detail')
      expect(stackDetail?.hasAttribute('hidden')).toBe(true)
    })
  })

  describe('dismiss', () => {
    it('should hide error bar when dismissed', async () => {
      // given
      const errorDetail: ErrorDetail = {
        source: 'TestSource',
        error: new Error('Test error'),
        timestamp: new Date(),
      }
      element.showError(errorDetail)
      await element.updateComplete

      const dismissButton = element.shadowRoot?.querySelector('.error-bar-dismiss') as HTMLButtonElement

      // when
      dismissButton?.click()
      await element.updateComplete

      // then
      expect(element.hasAttribute('hidden')).toBe(true)
      const errorBar = element.shadowRoot?.querySelector('.error-bar')
      expect(errorBar).toBeNull()
    })
  })

  describe('stack trace', () => {
    it('should show toggle button when error has stack trace', async () => {
      // given
      const error = new Error('Test error')
      const errorDetail: ErrorDetail = {
        source: 'TestSource',
        error,
        timestamp: new Date(),
      }

      // when
      element.showError(errorDetail)
      await element.updateComplete

      // then
      const toggleButton = element.shadowRoot?.querySelector('.error-bar-toggle')
      expect(toggleButton).toBeDefined()
    })

    it('should toggle stack trace visibility when button is clicked', async () => {
      // given
      const errorDetail: ErrorDetail = {
        source: 'TestSource',
        error: new Error('Test error'),
        timestamp: new Date(),
      }
      element.showError(errorDetail)
      await element.updateComplete

      const toggleButton = element.shadowRoot?.querySelector('.error-bar-toggle') as HTMLButtonElement
      const stackDetail = element.shadowRoot?.querySelector('.error-bar-detail')

      // expect
      expect(stackDetail?.hasAttribute('hidden')).toBe(true)
      expect(toggleButton?.textContent?.trim()).toBe('▼')

      // when
      toggleButton?.click()
      await element.updateComplete

      // then
      expect(stackDetail?.hasAttribute('hidden')).toBe(false)
      expect(toggleButton?.textContent?.trim()).toBe('▲')

      // when
      toggleButton?.click()
      await element.updateComplete

      // then
      expect(stackDetail?.hasAttribute('hidden')).toBe(true)
      expect(toggleButton?.textContent?.trim()).toBe('▼')
    })

    it('should display stack trace content', async () => {
      // given
      const error = new Error('Test error')
      const errorDetail: ErrorDetail = {
        source: 'TestSource',
        error,
        timestamp: new Date(),
      }
      element.showError(errorDetail)
      await element.updateComplete

      // when
      const toggleButton = element.shadowRoot?.querySelector('.error-bar-toggle') as HTMLButtonElement
      toggleButton?.click()
      await element.updateComplete

      // then
      const stackDetail = element.shadowRoot?.querySelector('.error-bar-detail')
      expect(stackDetail?.textContent).toContain('Error: Test error')
    })

    it('should not render toggle button or stack trace when error has no stack', async () => {
      // given
      const error = new Error('Test error without stack')
      delete (error as any).stack
      const errorDetail: ErrorDetail = {
        source: 'TestSource',
        error,
        timestamp: new Date(),
      }

      // when
      element.showError(errorDetail)
      await element.updateComplete

      // then
      const toggleButton = element.shadowRoot?.querySelector('.error-bar-toggle')
      const stackDetail = element.shadowRoot?.querySelector('.error-bar-detail')
      expect(toggleButton).toBeNull()
      expect(stackDetail).toBeNull()
    })
  })

  describe('accessibility', () => {
    it('should have aria-label on toggle button', async () => {
      // given
      const errorDetail: ErrorDetail = {
        source: 'TestSource',
        error: new Error('Test error'),
        timestamp: new Date(),
      }

      // when
      element.showError(errorDetail)
      await element.updateComplete

      // then
      const toggleButton = element.shadowRoot?.querySelector('.error-bar-toggle')
      expect(toggleButton?.getAttribute('aria-label')).toBe('Toggle stack trace')
    })

    it('should have aria-label on dismiss button', async () => {
      // given
      const errorDetail: ErrorDetail = {
        source: 'TestSource',
        error: new Error('Test error'),
        timestamp: new Date(),
      }

      // when
      element.showError(errorDetail)
      await element.updateComplete

      // then
      const dismissButton = element.shadowRoot?.querySelector('.error-bar-dismiss')
      expect(dismissButton?.getAttribute('aria-label')).toBe('Dismiss error')
    })
  })
})
