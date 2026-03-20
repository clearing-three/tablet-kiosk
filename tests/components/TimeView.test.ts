/**
 * TimeView Component Tests
 *
 * Tests for TimeView component covering:
 * - Passive rendering of time and date
 * - DOM element initialization
 */

import type { Mock } from 'vitest'
import { TimeView } from '../../src/components/Time/TimeView'
import * as formatters from '../../src/utils/formatters'

describe('TimeView', () => {
  let timeView: TimeView

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="time"></div>
      <div id="date"></div>
    `
    vi.spyOn(formatters, 'formatCurrentTime').mockReturnValue('14:30')
    vi.spyOn(formatters, 'formatCurrentDate').mockReturnValue(
      'Friday, February 20'
    )
    timeView = new TimeView()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should throw when required DOM elements are missing', () => {
      document.body.innerHTML = ''

      expect(() => new TimeView()).toThrow('Required DOM element not found')
    })

    it('should throw indicating which element is missing', () => {
      document.body.innerHTML = '<div id="time"></div>'

      expect(() => new TimeView()).toThrow('#date')
    })
  })

  describe('render()', () => {
    it('should display the formatted time', () => {
      timeView.render()

      expect(document.getElementById('time')!.textContent).toBe('14:30')
    })

    it('should display the formatted date', () => {
      timeView.render()

      expect(document.getElementById('date')!.textContent).toBe(
        'Friday, February 20'
      )
    })

    it('should call formatCurrentTime to get the time value', () => {
      timeView.render()

      expect(formatters.formatCurrentTime).toHaveBeenCalled()
    })

    it('should call formatCurrentDate to get the date value', () => {
      timeView.render()

      expect(formatters.formatCurrentDate).toHaveBeenCalled()
    })

    it('should reflect updated formatter output on each call', () => {
      ;(formatters.formatCurrentTime as Mock).mockReturnValue('09:05')
      ;(formatters.formatCurrentDate as Mock).mockReturnValue('Monday, March 2')

      timeView.render()

      expect(document.getElementById('time')!.textContent).toBe('09:05')
      expect(document.getElementById('date')!.textContent).toBe(
        'Monday, March 2'
      )
    })
  })
})
