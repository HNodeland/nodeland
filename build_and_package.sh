#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLIENT_DIR="$ROOT_DIR/client"
BUILD_DIR="$CLIENT_DIR/dist"

ZIP_PATH="$ROOT_DIR/nodeland.zip"

# 1) Build the client
echo "Building client..."
cd "$CLIENT_DIR"
npm run build

# 2) Copy build artifacts to public/ (create if needed, overwriting existing files)
echo "Copying build output to public/ (overwriting existing files if needed)..."
cd "$ROOT_DIR"
mkdir -p public
cp -a "$BUILD_DIR"/. public/
rm -rf "$BUILD_DIR"

# 3) Create zip archive, excluding specified files and folders
echo "Creating zip archive with 7-Zip (excluding unwanted files)..."
# Remove old archive if it exists
test -f "$ZIP_PATH" && rm -f "$ZIP_PATH"

cd "$ROOT_DIR"
"/c/Program Files/7-Zip/7z.exe" a -tzip "$ZIP_PATH" \
    ./* \
    "-x!./.gitignore" \
    "-x!./db.env.example" \
    "-x!./prompt.txt" \
    "-x!./prompt_creator.py" \
    "-x!./readme.md" \
    "-xr!docs\*" \
    "-x!./build_and_package.sh" \
    "-x!./docker-compose.yml" \

echo "Done. Archive created: $(basename "$ZIP_PATH")"