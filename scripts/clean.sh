#!/bin/bash

# Development helper script
# Cleans build artifacts and reinstalls dependencies

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${BLUE}🧹 Cleaning ENXP Platform...${NC}"

# Remove node_modules
echo "Removing node_modules..."
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Remove dist folders
echo "Removing dist folders..."
find . -name "dist" -type d -prune -exec rm -rf '{}' +

# Remove lock files
echo "Removing lock files..."
find . -name "package-lock.json" -type f -delete

# Remove logs
echo "Removing logs..."
rm -rf logs/*.log

# Remove tsbuildinfo
echo "Removing build info..."
find . -name "*.tsbuildinfo" -type f -delete

echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""
echo "Run 'npm install' to reinstall dependencies"
