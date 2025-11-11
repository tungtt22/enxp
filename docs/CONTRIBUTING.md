# Contributing to ENXP

Thank you for your interest in contributing to ENXP! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Collaborate openly and transparently

## How to Contribute

### Reporting Bugs

1. Check if the bug already exists in Issues
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Code samples if applicable

### Suggesting Features

1. Check existing feature requests
2. Create an issue describing:
   - Use case and motivation
   - Proposed solution
   - Alternative approaches considered
   - Impact on existing functionality

### Submitting Code

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/my-feature`
3. **Make your changes**: Follow coding standards
4. **Write tests**: Ensure code coverage
5. **Update documentation**: Keep docs in sync
6. **Commit changes**: Use clear commit messages
7. **Push to your fork**: `git push origin feature/my-feature`
8. **Create Pull Request**: With detailed description

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/enxp.git
cd enxp

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

## Coding Standards

### TypeScript

- Use TypeScript for all code
- Enable strict mode
- Provide comprehensive types
- Avoid `any` type unless necessary
- Use interfaces over types when possible

### Formatting

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in objects/arrays
- Maximum line length: 100 characters
- Use meaningful variable names

### Comments

- Write clear, concise comments
- Document complex logic
- Use JSDoc for public APIs
- Keep comments up-to-date

### Example

```typescript
/**
 * Load and activate a plugin
 * 
 * @param pluginPath - Absolute path to the plugin
 * @returns The loaded plugin instance
 * @throws Error if plugin fails to load or activate
 */
async loadPlugin(pluginPath: string): Promise<IPlugin> {
  // Validate path exists
  if (!fs.existsSync(pluginPath)) {
    throw new Error(`Plugin not found: ${pluginPath}`);
  }

  // Load the plugin
  const plugin = await this.loader.load(pluginPath);
  
  // Initialize with context
  await plugin.initialize(this.createContext());
  
  return plugin;
}
```

## Testing

### Unit Tests

- Test each function/method
- Mock external dependencies
- Use descriptive test names
- Aim for >80% coverage

```typescript
describe('PluginManager', () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager();
  });

  it('should load a plugin successfully', async () => {
    const plugin = await manager.loadPlugin('/path/to/plugin');
    expect(plugin).toBeDefined();
    expect(plugin.id).toBe('test-plugin');
  });

  it('should throw error for invalid plugin', async () => {
    await expect(manager.loadPlugin('/invalid/path'))
      .rejects.toThrow('Plugin not found');
  });
});
```

### Integration Tests

- Test plugin interactions
- Test lifecycle management
- Test event communication
- Test API endpoints

## Documentation

### Code Documentation

- Document all public APIs
- Include usage examples
- Describe parameters and return values
- Note any side effects or exceptions

### User Documentation

Update relevant docs:
- README.md - For new features
- PLUGIN_DEVELOPMENT.md - For API changes
- EXAMPLES.md - For new patterns
- ARCHITECTURE.md - For design changes

## Pull Request Guidelines

### PR Title

Use conventional commits format:
- `feat: Add new feature`
- `fix: Fix bug in plugin loader`
- `docs: Update API documentation`
- `refactor: Restructure plugin manager`
- `test: Add tests for backend plugin`
- `chore: Update dependencies`

### PR Description

Include:
- **What**: What changes were made
- **Why**: Motivation for the changes
- **How**: How it was implemented
- **Testing**: How it was tested
- **Screenshots**: If UI changes

### Example PR Description

```markdown
## What
Add support for plugin versioning and compatibility checking

## Why
Plugins need to declare compatible platform versions to prevent runtime errors

## How
- Added version field to plugin metadata
- Implemented semver compatibility checking
- Updated plugin loader to validate versions
- Added error messages for incompatible plugins

## Testing
- Added unit tests for version checking
- Tested with compatible and incompatible plugins
- Updated integration tests

## Breaking Changes
None - backwards compatible
```

## Commit Messages

Follow conventional commits:

```
type(scope): subject

body

footer
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Tests
- `chore` - Maintenance

### Examples

```
feat(cli): add --watch flag to build command

Add ability to watch and rebuild plugins automatically
during development.

Closes #123
```

```
fix(backend): prevent route conflicts between plugins

Namespaced all plugin routes under /api/plugins/{id}/
to avoid conflicts.

Fixes #456
```

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release branch
4. Run full test suite
5. Create release tag
6. Publish to npm (maintainers only)

## Getting Help

- Open an issue for questions
- Join our Discord/Slack (if available)
- Check documentation first
- Ask in pull request comments

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Acknowledged in documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to ENXP! 🎉
