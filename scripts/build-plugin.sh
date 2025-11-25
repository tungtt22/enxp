#!/bin/bash

# Build script for micro frontend plugin
# This script builds the plugin in both integrated and standalone modes

PLUGIN_NAME=${1:-"projects-management"}
PLUGIN_DIR="plugins/$PLUGIN_NAME"

echo "🚀 Building plugin: $PLUGIN_NAME"
echo "================================"

# Navigate to plugin directory
cd "$PLUGIN_DIR" || exit 1

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  pnpm install
fi

# Build TypeScript first
echo "🔨 Building TypeScript..."
pnpm run build

# Build for Module Federation (integrated mode)
echo "📦 Building for Module Federation..."
pnpm run build

# Build for standalone mode
echo "🏗️  Building standalone mode..."
pnpm run build:standalone

echo "✅ Build complete!"
echo ""
echo "📍 Plugin can be:"
echo "  - Integrated: Import from dist/"
echo "  - Remote: Load from dist/assets/remoteEntry.js"
echo "  - Standalone: Serve dist/ as standalone app"
