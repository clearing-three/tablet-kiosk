import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  {
    ignores: [
      'dist/**',
      'src/dist/**',
      'node_modules/**',
      'public/**',
      'app.js',
      'moon-phase.js',
    ],
  },
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        HTMLObjectElement: 'readonly',
        HTMLElement: 'readonly',
        SVGElement: 'readonly',
        Element: 'readonly',
        Event: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...prettier.rules,

      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // General rules
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',

      // Style rules (let Prettier handle most formatting)
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'never'],
    },
  },
  // Test files configuration
  {
    files: ['tests/**/*.{js,ts}', '**/*.test.{js,ts}', '**/*.spec.{js,ts}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Jest globals
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',

        // Browser globals for testing
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        global: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        process: 'readonly',
        Image: 'readonly',
        HTMLElement: 'readonly',
        SVGElement: 'readonly',
        Element: 'readonly',
        Event: 'readonly',
        EventInit: 'readonly',
        NodeJS: 'readonly',
        NodeListOf: 'readonly',

        // Browser API types
        Response: 'readonly',
        RequestInit: 'readonly',
        Document: 'readonly',
        GeolocationPosition: 'readonly',
        GeolocationPositionError: 'readonly',
        GeolocationCoordinates: 'readonly',
        ResizeObserverCallback: 'readonly',
        ResizeObserverEntry: 'readonly',
        IntersectionObserverCallback: 'readonly',
        IntersectionObserverEntry: 'readonly',

        // Storage and additional APIs
        localStorage: 'readonly',
        clearTimeout: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...prettier.rules,

      // Relaxed rules for tests
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in test files
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-namespace': 'off', // Allow global namespace augmentation in tests

      // Allow console statements in tests
      'no-console': 'off',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',

      // Style rules
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'never'],
    },
  },
]
