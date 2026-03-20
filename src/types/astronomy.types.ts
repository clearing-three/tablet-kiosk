/**
 * TypeScript interfaces for astronomical data and calculations
 *
 * These interfaces define structures for solar data (sunrise and sunset times)
 * and related astronomical data used throughout the application.
 */

import { z } from 'zod'

// Solar times (sunrise and sunset) for a given day
export const SolarTimesSchema = z
  .object({
    sunrise: z.number().positive(),
    sunset: z.number().positive(),
  })
  .refine(data => data.sunrise < data.sunset, {
    message: 'Sunrise must be before sunset',
  })

export type SolarTimes = z.infer<typeof SolarTimesSchema>
