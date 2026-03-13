/**
 * NASA Dial-a-Moon API mocks for testing
 *
 * Provides mock responses for NASA Dial-a-Moon API scenarios including
 * success, error, and edge cases for comprehensive testing coverage.
 */

import type { NasaMoonApiResponse } from '../../src/types/nasa.types'

/**
 * Mock successful NASA Dial-a-Moon API response
 */
export const mockNasaSuccessResponse: NasaMoonApiResponse = {
  image: {
    url: 'https://svs.gsfc.nasa.gov/vis/a000000/a005100/a005187/frames/730x730_1x1_30p/moon.5187.jpg',
    width: 730,
    height: 730,
    alt_text: 'Moon phase visualization for the given timestamp',
  },
}

/**
 * Mock NASA API error responses
 */
export const mockNasaErrorResponses = {
  // 404 Not Found - Invalid timestamp or missing data
  notFound: {
    status: 404,
    ok: false,
    statusText: 'Not Found',
    json: async () => {
      throw new Error('Not Found')
    },
  },

  // 500 Internal Server Error
  serverError: {
    status: 500,
    ok: false,
    statusText: 'Internal Server Error',
    json: async () => ({
      error: 'Internal server error',
    }),
  },

  // Network error (no status)
  networkError: {
    status: 0,
    ok: false,
    statusText: 'Network Error',
    json: async () => {
      throw new Error('Network request failed')
    },
  },

  // Invalid JSON response
  invalidJson: {
    status: 200,
    ok: true,
    statusText: 'OK',
    json: async () => {
      throw new SyntaxError('Unexpected token < in JSON at position 0')
    },
  },
}

/**
 * Mock responses for edge cases
 */
export const mockNasaEdgeCaseResponses = {
  // Missing image object
  missingImage: {
    status: 200,
    ok: true,
    statusText: 'OK',
    json: async () => ({
      // Missing image field
    }),
  },

  // Missing url in image object
  missingUrl: {
    status: 200,
    ok: true,
    statusText: 'OK',
    json: async () => ({
      image: {
        width: 730,
        height: 730,
        alt_text: 'Moon phase visualization',
        // Missing url field
      },
    }),
  },

  // Invalid url type
  invalidUrlType: {
    status: 200,
    ok: true,
    statusText: 'OK',
    json: async () => ({
      image: {
        url: 12345, // Should be string
        width: 730,
        height: 730,
        alt_text: 'Moon phase visualization',
      },
    }),
  },
}

/**
 * NASA Dial-a-Moon API Mock utility class
 */
export class NasaMoonApiMock {
  /**
   * Sets up the global fetch mock
   */
  static setup(): void {
    global.fetch = vi.fn()
  }

  /**
   * Resets all mocks
   */
  static reset(): void {
    vi.resetAllMocks()
  }

  /**
   * Tears down mocks
   */
  static teardown(): void {
    vi.restoreAllMocks()
  }

  /**
   * Mocks a successful API response
   */
  static mockSuccess(
    data: NasaMoonApiResponse = mockNasaSuccessResponse
  ): void {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => data,
    })
  }

  /**
   * Mocks an error response
   */
  static mockError(errorType: keyof typeof mockNasaErrorResponses): void {
    const errorResponse = mockNasaErrorResponses[errorType]
    ;(global.fetch as any).mockResolvedValueOnce(errorResponse)
  }

  /**
   * Mocks an edge case response
   */
  static mockEdgeCase(caseType: keyof typeof mockNasaEdgeCaseResponses): void {
    const edgeCaseResponse = mockNasaEdgeCaseResponses[caseType]
    ;(global.fetch as any).mockResolvedValueOnce(edgeCaseResponse)
  }

  /**
   * Mocks a network failure
   */
  static mockNetworkFailure(): void {
    ;(global.fetch as any).mockRejectedValueOnce(
      new TypeError('Network request failed')
    )
  }
}
