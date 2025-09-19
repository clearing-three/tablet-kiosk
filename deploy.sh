#!/bin/bash

DEST_DIR="/sdcard/Android/data/de.ozerov.fully/files/html"
SOURCE_DIR="dist"
FILES=("index.html" "moon-phase.js")
ICONS_DIR="weather-icons"
ASSETS_DIR="assets"

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
  adb shell ls -lh "$DEST_DIR/$ASSETS_DIR" 2>/dev/null || echo "(no assets folder)"
}

clean_files() {
  for file in "${FILES[@]}"; do
    adb shell rm -f "$DEST_DIR/$file"
  done
  adb shell rm -rf "$DEST_DIR/$ICONS_DIR"
  adb shell rm -rf "$DEST_DIR/$ASSETS_DIR"
  echo "All deployed files, icons, and assets removed from device."
}

deploy_files() {
  # Check if dist directory exists
  if [[ ! -d "$SOURCE_DIR" ]]; then
    echo "Error: $SOURCE_DIR directory not found. Run 'npm run build' first."
    exit 1
  fi

  # Deploy main files from dist/
  for file in "${FILES[@]}"; do
    if [[ -f "$SOURCE_DIR/$file" ]]; then
      adb push "$SOURCE_DIR/$file" "$DEST_DIR/" > /dev/null
      echo "Deployed: $file"
    else
      echo "Missing: $SOURCE_DIR/$file (skipped)"
    fi
  done

  # Deploy weather icons from dist/
  if [[ -d "$SOURCE_DIR/$ICONS_DIR" ]]; then
    adb push "$SOURCE_DIR/$ICONS_DIR" "$DEST_DIR/" > /dev/null
    echo "Deployed icon folder: $ICONS_DIR/"
  else
    echo "Missing icon folder: $SOURCE_DIR/$ICONS_DIR (skipped)"
  fi

  # Deploy assets directory from dist/
  if [[ -d "$SOURCE_DIR/$ASSETS_DIR" ]]; then
    adb push "$SOURCE_DIR/$ASSETS_DIR" "$DEST_DIR/" > /dev/null
    echo "Deployed assets folder: $ASSETS_DIR/"
  else
    echo "Missing assets folder: $SOURCE_DIR/$ASSETS_DIR (skipped)"
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
