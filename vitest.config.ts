import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    testTimeout: 10000,
    clearMocks: true,
    restoreMocks: true,
    env: {
      NODE_ENV: 'production',
      VITE_OPENWEATHER_API_KEY: 'test-api-key',
      VITE_LOCATION_LAT: '40.7128',
      VITE_LOCATION_LON: '-74.0060',
      VITE_WEATHER_UPDATE_INTERVAL: '600000',
      VITE_CLOCK_UPDATE_INTERVAL: '1000',
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        '**/*.d.ts',
        'src/config/environment.ts',
        'src/types/**',
        'src/main.ts',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
})
