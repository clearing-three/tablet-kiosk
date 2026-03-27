import type { WeatherData } from '@/types/weather-domain.types'
import { createContext } from '@lit/context'

export const WeatherContext = createContext<WeatherData>(
  Symbol('weather-context'),
)
