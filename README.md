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

Since this is a client-side HTML/JS/CSS application, there are no build commands or package managers. Development is file-based.

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


