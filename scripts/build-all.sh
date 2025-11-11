#!/bin/bash

# Build all packages and plugins

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${BLUE}🔨 Building ENXP Platform...${NC}"

# Get project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Build packages in order
echo "Building packages..."
cd packages/core && npm run build
cd ../backend && npm run build
cd ../frontend && npm run build

# Build plugins
echo "Building plugins..."
cd ../../plugins/projects && npm run build
cd ../templates && npm run build
cd ../activity && npm run build

# Build frontend app
echo "Building frontend app..."
cd ../../frontend-app && npm run build

cd "$PROJECT_ROOT"
echo -e "${GREEN}✅ Build complete${NC}"
