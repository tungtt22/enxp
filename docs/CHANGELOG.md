# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of ENXP platform
- Core plugin system with lifecycle management
- Backend plugin infrastructure with Express.js integration
- Frontend plugin infrastructure with React integration
- CLI tool for plugin management
- Comprehensive documentation and examples

### Features

#### Core Package (@enxp/core)
- Plugin registry and loader
- Plugin lifecycle management (load, initialize, activate, deactivate, destroy)
- Event system for inter-plugin communication
- Plugin context with logger, events, config, registry, and API
- Base plugin class with hooks
- Type-safe interfaces and definitions

#### Backend Package (@enxp/backend)
- Backend plugin base class
- Express server with plugin support
- Automatic API route registration
- Middleware support
- Service and model registration
- Event handling

#### Frontend Package (@enxp/frontend)
- Frontend plugin base class
- React integration with PluginProvider
- Hooks: usePlugins, usePlugin, usePluginRoutes, usePluginMenuItems, usePluginWidgets
- Component registration system
- Route management
- Widget system
- Theme support
- Menu item integration

#### CLI Package (@enxp/cli)
- `create` command - Generate plugin scaffolds
- `build` command - Compile plugins
- `install` command - Install plugins
- `uninstall` command - Remove plugins
- `list` command - List installed plugins
- `dev` command - Watch mode for development
- Plugin generator with templates
- Plugin builder with watch support
- Plugin installer with validation

### Documentation
- README.md - Main project documentation
- QUICKSTART.md - 5-minute quick start guide
- SUMMARY.md - Complete platform summary
- docs/GETTING_STARTED.md - Detailed tutorial
- docs/PLUGIN_DEVELOPMENT.md - Development guide
- docs/EXAMPLES.md - Real-world examples
- docs/ARCHITECTURE.md - System architecture
- CONTRIBUTING.md - Contribution guidelines

### Examples Included
- Product API plugin (REST CRUD)
- Authentication plugin (JWT)
- Dashboard widget plugin
- Database plugin (MongoDB)
- Notification system plugin
- Theme plugin

## [1.0.0] - 2024-11-10

### Added
- Initial stable release
- Production-ready plugin system
- Full TypeScript support
- Comprehensive test coverage
- Complete documentation

---

## Version History

### Versioning Guidelines

- **Major version (X.0.0)**: Breaking changes
- **Minor version (0.X.0)**: New features, backwards compatible
- **Patch version (0.0.X)**: Bug fixes, backwards compatible

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting
- `refactor`: Code restructuring
- `perf`: Performance improvements
- `test`: Test changes
- `chore`: Maintenance tasks

---

[Unreleased]: https://github.com/username/enxp/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/username/enxp/releases/tag/v1.0.0
