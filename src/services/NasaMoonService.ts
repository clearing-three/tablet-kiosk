/**
 * NASA Moon Service
 *
 * Service class for handling NASA Dial-a-Moon API interactions.
 * Provides type-safe moon image fetching and error handling.
 */

import type {
  NasaMoonApiResponse,
  NasaMoonImage,
} from '../types/nasa-api.types'

export class NasaMoonService {
  static readonly Errors = {
    missingImageData: 'Invalid API response: missing image data',
    missingImageUrl: 'Invalid API response: missing or invalid image URL',
    httpError: (status: number, statusText: string) =>
      `HTTP ${status}: ${statusText}`,
  } as const

  private readonly baseUrl = 'https://svs.gsfc.nasa.gov/api/dialamoon/'

  /**
   * Formats a Date object to NASA API timestamp format (YYYY-MM-DDTHH:MM UTC)
   * @param date Date to format
   * @returns Formatted timestamp string
   */
  formatTimestamp(date: Date): string {
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  /**
   * Fetches moon image data from NASA Dial-a-Moon API for a given timestamp
   * @param date Date for which to fetch moon image
   * @returns Promise<NasaMoonImage> Moon image data
   * @throws Error if API call fails or returns invalid data
   */
  async fetchMoonImage(date: Date): Promise<NasaMoonImage> {
    const timestamp = this.formatTimestamp(date)
    const url = `${this.baseUrl}${timestamp}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        NasaMoonService.Errors.httpError(response.status, response.statusText),
      )
    }

    const data: NasaMoonApiResponse = await response.json()

    // Validate response structure
    if (!data.image || typeof data.image !== 'object') {
      throw new Error(NasaMoonService.Errors.missingImageData)
    }

    if (!data.image.url || typeof data.image.url !== 'string') {
      throw new Error(NasaMoonService.Errors.missingImageUrl)
    }

    return data.image
  }

  /**
   * Fetches moon image data for the current time
   * @returns Promise<NasaMoonImage> Moon image data for current time
   */
  async getCurrentMoonImage(): Promise<NasaMoonImage> {
    return this.fetchMoonImage(new Date())
  }
}
