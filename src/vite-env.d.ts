/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENWEATHER_API_KEY: string
  readonly VITE_LOCATION_LAT: string
  readonly VITE_LOCATION_LON: string
  readonly VITE_WEATHER_UPDATE_INTERVAL: string
  readonly VITE_CLOCK_UPDATE_INTERVAL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
