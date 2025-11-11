# ENXP Scripts

Development and management scripts for ENXP Platform.

## Available Scripts

### `platform.sh` - Platform Management

Manage the ENXP platform lifecycle.

```bash
# Start the platform
./scripts/platform.sh start

# Stop the platform
./scripts/platform.sh stop

# Restart the platform
./scripts/platform.sh restart

# Check platform status
./scripts/platform.sh status
```

### `build-all.sh` - Build Everything

Build all packages, plugins, and frontend app in the correct order.

```bash
./scripts/build-all.sh
```

This will build:
1. Core package
2. Backend package
3. Frontend package
4. All plugins (projects, templates, activity)
5. Frontend app

### `clean.sh` - Clean Build Artifacts

Remove all build artifacts, dependencies, and logs.

```bash
./scripts/clean.sh
```

This removes:
- `node_modules` directories
- `dist` directories
- `package-lock.json` files
- Log files
- TypeScript build info files

**Note:** Run `npm install` after cleaning to reinstall dependencies.

## Usage Examples

### Fresh Start

```bash
# Clean everything
./scripts/clean.sh

# Install dependencies
npm install

# Build everything
./scripts/build-all.sh

# Start platform
./scripts/platform.sh start
```

### Development Workflow

```bash
# Check if platform is running
./scripts/platform.sh status

# Restart after changes
./scripts/platform.sh restart
```

### Rebuild After Changes

```bash
# Build only what changed
cd packages/backend && npm run build

# Or rebuild everything
./scripts/build-all.sh
```

## Notes

- All scripts use relative paths and work from any location
- Scripts use colors for better readability
- Platform scripts create logs in `logs/` directory
- Build scripts exit on first error (`set -e`)
