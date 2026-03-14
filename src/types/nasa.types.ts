/**
 * TypeScript interfaces for NASA Dial-a-Moon API
 *
 * These interfaces define the structure of data received from the NASA
 * Dial-a-Moon API, which provides moon imagery for any given timestamp.
 */

// Moon image data returned by the API
export interface NasaMoonImage {
  url: string
  width: number
  height: number
  alt_text: string
}

// Complete API response structure
export interface NasaMoonApiResponse {
  image: NasaMoonImage
}
