// Application configuration
interface AppConfig {
  weatherUpdateIntervalMs: number
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  weatherUpdateIntervalMs: 10 * 60 * 1000,
}
