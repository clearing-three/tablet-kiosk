#!/bin/bash

DEST_DIR="/sdcard/Android/data/de.ozerov.fully/files/html"
FILES=("kiosk.html" "styles.css" "app.js" "moon-phase.js")
ICONS_DIR="weather-icons"

usage() {
  echo "Usage: $0 [OPTIONS]"
  echo "Deploy kiosk files to connected Android device."
  echo
  echo "Options:"
  echo "  -h, --help     Show this help message"
  echo "  -l, --list     List deployed files on the device"
  echo "  -c, --clean    Remove all deployed files from the device"
  echo
  echo "If no options are provided, files will be pushed to the device."
}

list_files() {
  adb shell ls -lh "$DEST_DIR"
  adb shell ls -lh "$DEST_DIR/$ICONS_DIR" 2>/dev/null || echo "(no icon folder)"
}

clean_files() {
  for file in "${FILES[@]}"; do
    adb shell rm -f "$DEST_DIR/$file"
  done
  adb shell rm -rf "$DEST_DIR/$ICONS_DIR"
  echo "All deployed files and icons removed from device."
}

deploy_files() {
  for file in "${FILES[@]}"; do
    if [[ -f "$file" ]]; then
      adb push "$file" "$DEST_DIR/" > /dev/null
      echo "Deployed: $file"
    else
      echo "Missing: $file (skipped)"
    fi
  done

  if [[ -d "$ICONS_DIR" ]]; then
    adb push "$ICONS_DIR" "$DEST_DIR/" > /dev/null
    echo "Deployed icon folder: $ICONS_DIR/"
  else
    echo "Missing icon folder: $ICONS_DIR (skipped)"
  fi
}

case "$1" in
  -h|--help)
    usage
    ;;
  -l|--list)
    list_files
    ;;
  -c|--clean)
    clean_files
    ;;
  "")
    deploy_files
    ;;
  *)
    echo "Unknown option: $1"
    usage
    exit 1
    ;;
esac
