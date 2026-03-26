import { createContext } from '@lit/context'
import { WeatherData } from '@/types/weather-domain.types'

export const WeatherContext = createContext<WeatherData>(
  Symbol('weather-context')
)
