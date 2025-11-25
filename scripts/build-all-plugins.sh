#!/bin/bash

# Build all plugins for micro frontend deployment

echo "🚀 Building all plugins for micro frontend..."
echo "=============================================="

PLUGINS_DIR="plugins"
FAILED=()
SUCCESS=()

# Find all plugin directories
for plugin_dir in "$PLUGINS_DIR"/*/; do
  plugin_name=$(basename "$plugin_dir")
  
  echo ""
  echo "📦 Building plugin: $plugin_name"
  echo "-----------------------------------"
  
  cd "$plugin_dir" || continue
  
  # Check if vite.config.ts exists (micro frontend plugin)
  if [ -f "vite.config.ts" ]; then
    echo "Building as micro frontend plugin..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
      echo "Installing dependencies..."
      pnpm install
    fi
    
    # Build TypeScript
    if [ -f "tsconfig.json" ]; then
      pnpm run build 2>&1
      
      if [ $? -eq 0 ]; then
        SUCCESS+=("$plugin_name")
        echo "✅ $plugin_name built successfully"
      else
        FAILED+=("$plugin_name")
        echo "❌ $plugin_name build failed"
      fi
    fi
  else
    echo "⏭️  Skipping (not a micro frontend plugin)"
  fi
  
  cd - > /dev/null
done

echo ""
echo "=============================================="
echo "📊 Build Summary"
echo "=============================================="
echo "✅ Success: ${#SUCCESS[@]} plugins"
for plugin in "${SUCCESS[@]}"; do
  echo "   - $plugin"
done

if [ ${#FAILED[@]} -gt 0 ]; then
  echo "❌ Failed: ${#FAILED[@]} plugins"
  for plugin in "${FAILED[@]}"; do
    echo "   - $plugin"
  done
  exit 1
else
  echo ""
  echo "🎉 All plugins built successfully!"
fi
