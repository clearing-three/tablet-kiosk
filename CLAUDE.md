# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a weather kiosk application designed for tablet displays, specifically targeting Samsung Galaxy Tab S8 Ultra running in Fully Kiosk Browser. The app displays current weather, forecast, astronomical times (sunrise/sunset, moonrise/moonset), and moon phase information.

## Architecture

### Core Files
- `src/index.html`: Main HTML structure with semantic layout for left/right panels
- `src/main.ts`: Main application entry point and orchestration
- `src/services/`: TypeScript service modules for weather API, moon phase, and time services
- `src/components/`: Modular UI components for weather display, forecast, astronomy, and time
- `src/styles/main.css`: CSS with CSS custom properties for theming and responsive viewport units
- `moon-phase.js`: Third-party library for moon phase calculations and SVG rendering

### Data Flow
1. App fetches weather data from OpenWeatherMap One Call 3.0 API every 10 minutes
2. Weather icons are mapped from OpenWeatherMap codes to local SVG files in `public/weather-icons/`
3. Moon phase calculations use Julian date calculations to determine current lunar phase
4. All times are formatted in 24-hour format using `formatTimeFromUnix()`

### Configuration
- Weather API configuration (API key, coordinates) is managed via environment variables in `.env.local`
- Icon mapping from OpenWeatherMap codes to local SVGs in `src/utils/iconMapper.ts`


## Code Patterns

### Weather Data Handling
- All weather data comes from OpenWeatherMap One Call 3.0 API
- Temperature values are rounded using `Math.round()`
- Weather icons use SVG objects for scalability
- Forecast shows next 3 days (skipping today)

### Time Management
- Clock updates every second via `setInterval`
- Weather data updates every 10 minutes
- All Unix timestamps converted using `formatTimeFromUnix()`

### Moon Phase Rendering
- Uses external `phase_junk()` function from `moon-phase.js`
- Dynamically generates SVG paths based on lunar phase decimal (0-1)
- Moon phase names calculated in `src/services/MoonPhaseService.ts`

### Styling
- Uses CSS custom properties for consistent theming
- Viewport units (vh, vw) for responsive tablet display
- Color scheme optimized for dark backgrounds with blue accent colors

## External Resources

### Weather Icons
The SVG weather icons in `public/weather-icons/` directory are sourced from:
- **Repository**: https://github.com/basmilius/weather-icons
- Custom SVG icons designed for weather applications
- **Build Process**: Icons are served as static assets via Vite's public directory and copied to `dist/weather-icons/` during build

### Moon Phase Script
The `moon-phase.js` file is sourced from:
- **Repository**: https://github.com/tingletech/moon-phase
- Contains lunar phase calculations and SVG path generation
- Uses Julian date calculations and astronomical algorithms for accurate moon phase rendering

## Development Workflow

### Branch Protection
**IMPORTANT**: Never make code changes when on the `main` branch. If the user requests changes while on `main`:
1. Check current branch with `git branch --show-current`
2. If on `main`, do NOT make any file changes
3. Inform the user: "Currently on main branch. Should I create a feature branch or would you like to switch branches first?"
4. Wait for user instructions before proceeding

This prevents accidental commits to the main branch and maintains clean git history.