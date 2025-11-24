#!/bin/bash

# Script to update integrate-sdk in all framework examples
# Usage: ./update-integrate-sdk.sh

set -e  # Exit on error

BASE_DIR="frameworks"
DIRS=("frontend" "backend" "mobile")

echo "🚀 Updating integrate-sdk in all framework examples..."
echo ""

# Process frameworks directory
for dir in "${DIRS[@]}"; do
  if [ ! -d "$BASE_DIR/$dir" ]; then
    echo "⚠️  Directory $BASE_DIR/$dir not found, skipping..."
    continue
  fi

  echo "📁 Processing $BASE_DIR/$dir..."
  
  for example_dir in "$BASE_DIR/$dir"/*; do
    if [ -d "$example_dir" ]; then
      example_name=$(basename "$example_dir")
      echo "  🔄 Updating $example_name..."
      
      if [ -f "$example_dir/package.json" ]; then
        (cd "$example_dir" && bun add integrate-sdk@latest)
        echo "  ✅ Updated $example_name"
      else
        echo "  ⚠️  No package.json found in $example_name, skipping..."
      fi
    fi
  done
  
  echo ""
done

# Process ai directory
if [ -d "ai" ]; then
  echo "📁 Processing ai..."
  
  for example_dir in "ai"/*; do
    if [ -d "$example_dir" ]; then
      example_name=$(basename "$example_dir")
      echo "  🔄 Updating $example_name..."
      
      if [ -f "$example_dir/package.json" ]; then
        (cd "$example_dir" && bun add integrate-sdk@latest)
        echo "  ✅ Updated $example_name"
      else
        echo "  ⚠️  No package.json found in $example_name, skipping..."
      fi
    fi
  done
  
  echo ""
fi

echo "✨ All updates complete!"

