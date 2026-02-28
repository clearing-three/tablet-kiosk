/**
 * TypeScript interfaces for application configuration and internal types
 *
 * These interfaces define the structure for application configuration objects,
 * DOM element references, interval management, and other internal application types.
 */

// Application configuration
export interface AppConfig {
  weatherUpdateIntervalMs: number
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  weatherUpdateIntervalMs: 10 * 60 * 1000,
}

// Environment configuration
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test'
  VITE_API_KEY: string
  VITE_LATITUDE: string
  VITE_LONGITUDE: string
  VITE_WEATHER_UPDATE_INTERVAL?: string
  VITE_CLOCK_UPDATE_INTERVAL?: string
}

// DOM element references for type safety
export interface DOMElements {
  // Time and date elements
  time: Element
  date: Element

  // Current weather elements
  weatherIcon: Element
  tempNow: Element
  weatherDesc: Element
  weatherRange: Element

  // Astronomy elements
  sunriseTime: Element
  sunsetTime: Element
  moonriseTime: Element
  moonsetTime: Element
  moon: Element
  moonPhaseName: Element

  // Forecast container
  forecast: Element
}

// Interval management
export interface AppIntervals {
  clockUpdate: number | null
  weatherUpdate: number | null
}

// Application state
export interface AppState {
  isInitialized: boolean
  lastWeatherUpdate: Date | null
  currentWeatherData: unknown | null // Will be typed more specifically in Phase 2
  hasError: boolean
  errorMessage: string | null
}

// Weather icon mapping configuration
export interface WeatherIconMap {
  [key: string]: string
}

// Application error types
export enum AppErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
  DOM_ERROR = 'DOM_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Application error interface
export interface AppError {
  type: AppErrorType
  message: string
  originalError?: Error
  timestamp: Date
  context?: Record<string, unknown>
}

// Event handler types
export type EventHandler<T = unknown> = (event: T) => void
export type AsyncEventHandler<T = unknown> = (event: T) => Promise<void>

// Update callback types
export type UpdateCallback = () => void
export type AsyncUpdateCallback = () => Promise<void>

// Service initialization parameters
export interface ServiceInitParams {
  config: AppConfig
  domElements: DOMElements
}

// Application lifecycle phases
export enum AppLifecyclePhase {
  INITIALIZING = 'INITIALIZING',
  LOADING_CONFIG = 'LOADING_CONFIG',
  CONNECTING_API = 'CONNECTING_API',
  RENDERING_UI = 'RENDERING_UI',
  RUNNING = 'RUNNING',
  ERROR = 'ERROR',
}

// Application lifecycle state
export interface AppLifecycleState {
  phase: AppLifecyclePhase
  startTime: Date
  lastTransition: Date
  error?: AppError
}

// Logging levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Log entry interface
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: Record<string, unknown>
  error?: Error
}

// Application logger interface
export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void
  info(message: string, context?: Record<string, unknown>): void
  warn(message: string, context?: Record<string, unknown>): void
  error(message: string, error?: Error, context?: Record<string, unknown>): void
}

// Utility type for making properties optional
export type Partial<T> = {
  [P in keyof T]?: T[P]
}

// Utility type for making properties required
export type Required<T> = {
  [P in keyof T]-?: T[P]
}

// Utility type for configuration validation
export type ConfigValidationResult = {
  isValid: boolean
  errors: string[]
  warnings: string[]
}
