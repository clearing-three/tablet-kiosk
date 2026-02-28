# Kiosk

A weather kiosk app for tablet displays. Shows current weather, a 3-day forecast, astronomical times (sunrise/sunset, moonrise/moonset), moon phase, and a live clock. Designed for a Samsung Galaxy Tab S8 Ultra running in Fully Kiosk Browser, pulling data from the OpenWeatherMap One Call 3.0 API.

## Development

### Kiosk environment setup

```bash
cp .env.example .env.local
```

Edit `.env.local` and set OpenWeatherMap API key and coordinates.

### Initialization

```bash
nvm use
npm ci
```

### Running Locally
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production (TypeScript compilation + Vite build)
- `npm run preview`: Preview production build locally

### Validation
```bash
npm run format && npm run lint:fix && npm run lint && npm test && npm run build
```

### Test Coverage
- `npm run test:coverage`: Run tests with coverage report (open `coverage/index.html` to view)

## Deployment

Requires tablet setup — see [Tablet](#tablet) section below.

1. Install Android Debug Bridge.
```bash
sudo apt install android-tools-adb
adb devices
```
2. Use `deploy.sh`.

### Deployment Commands
- `./deploy.sh`: Deploy files to connected Android tablet via ADB
- `./deploy.sh -l`: List deployed files on device
- `./deploy.sh -c`: Clean/remove all deployed files from device

## Design

### Call Stack Roots

There are two recurring call stack roots and one startup root. Error handling
is consolidated at these points.

| Root | Location | Trigger |
|---|---|---|
| App startup | `DOMContentLoaded` handler in `main.ts` | Page load |
| Weather update | `updateWeatherData()` in `main.ts` | `setInterval` every 10 min |
| Clock update | `startUpdates()` interval in `TimeDisplay.ts` | `setInterval` every 1 sec |

## Third-Party Assets

### Weather Icons
The SVG weather icons in `public/weather-icons/` are sourced from [basmilius/weather-icons](https://github.com/basmilius/weather-icons). They are served as static assets via Vite's public directory and copied to `dist/weather-icons/` during build.

### Moon Phase Script
`moon-phase.js` is sourced from [tingletech/moon-phase](https://github.com/tingletech/moon-phase). It provides lunar phase calculations and SVG path generation using Julian date and astronomical algorithms.

## Tablet

* Samsung Galaxy Tab S8 Ultra

### Install Kiosk App
1. Install "Fully Kiosk Browser"

### Enable Developer Mode
1. Settings → About tablet → Software information
    * Tap Build Number 7 times
2. Settings → Developer options
    * Turn on USB debugging
