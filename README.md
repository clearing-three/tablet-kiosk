# Kiosk

## Tablet

* Samsung Galaxy Tab S8 Ultra


### Install Kiosk App
1. Install "Fully Kiosk Browser"

### Enable Developer Mode
1. Settings → About tablet → Software information
    * Tap Build Number 7 times
3. Settings → Developer options
    * Turn on USB debugging

## Development

This is a TypeScript application built with Vite. Here are the common development commands:

### Setup
```bash
npm install
```

### Development Commands
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production (TypeScript compilation + Vite build)
- `npm run preview`: Preview production build locally

### Testing
- `npm test`: Run tests once
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Run tests with coverage report

### Code Quality
- `npm run lint`: Check code with ESLint
- `npm run lint:fix`: Fix ESLint issues automatically
- `npm run format`: Format code with Prettier
- `npm run type-check`: Type check without emitting files

## Deployment

1. Enable devloper mode on the tablet, see instructions in this doc.
2. Install Android Debug Bridge.
```
sudo apt install android-tools-adb
adb devices
```
3. Use `deploy.sh`, see instructions below.

### Deployment Commands
- `./deploy.sh`: Deploy files to connected Android tablet via ADB
- `./deploy.sh -l`: List deployed files on device
- `./deploy.sh -c`: Clean/remove all deployed files from device


