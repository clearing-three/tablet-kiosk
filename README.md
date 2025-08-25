# Kiosk

## Device

* Samsung Galaxy Tab S8 Ultra


### Install Kiosk App
1. Install "Fully Kiosk Browser"

### Enable Developer Mode
1. Settings → About tablet → Software information
    * Tap Build Number 7 times
3. Settings → Developer options
    * Turn on USB debugging

## Debian
```bash

sudo apt install android-tools-adb

adb devices

adb push ./kiosk.html /sdcard/Android/data/de.ozerov.fully/files/html

adb shell ls /sdcard/Android/data/de.ozerov.fully/files/html/

```


