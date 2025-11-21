# API Testing & Documentation

## Overview

This document describes the API endpoints, testing infrastructure, and documentation system for the ENXP platform with VS Code-style plugin architecture.

## Active Plugins & Endpoints

### Projects Management Plugin (projects-management)
**Base Path:** `/api/plugins/projects`

```bash
# Get all projects
GET /api/plugins/projects/projects

# Get project by ID
GET /api/plugins/projects/projects/:id

# Create project
POST /api/plugins/projects/projects
Body: {
  "name": "Project Name",
  "description": "Description",
  "status": "active" | "completed" | "archived"
}

# Update project
PUT /api/plugins/projects/projects/:id
Body: {
  "name": "Updated Name",
  "description": "Updated Description",
  "status": "completed"
}

# Delete project
DELETE /api/plugins/projects/projects/:id
```

### Activity Management Plugin (activity-management)
**Base Path:** `/api/plugins/activity-management`

```bash
# Get all activities (with optional filters)
GET /api/plugins/activity-management/activities
Query params:
  - type: deployment | build | commit | review | issue
  - status: success | failed | pending | in_progress

# Get activity by ID
GET /api/plugins/activity-management/activities/:id

# Create activity
POST /api/plugins/activity-management/activities
Body: {
  "type": "deployment",
  "status": "success",
  "title": "Deploy to Production",
  "description": "v1.2.0 deployed",
  "metadata": {
    "version": "1.2.0",
    "environment": "production"
  }
}

# Update activity
PUT /api/plugins/activity-management/activities/:id
Body: {
  "status": "failed",
  "description": "Updated description"
}

# Delete activity
DELETE /api/plugins/activity-management/activities/:id

# Get statistics
GET /api/plugins/activity-management/stats
Response: {
  "total": 5,
  "byType": { "deployment": 1, "build": 1, ... },
  "byStatus": { "success": 3, "pending": 1, ... }
}
```

### Templates Management Plugin (templates-management)
**Base Path:** `/api/plugins/templates-management`

```bash
# Get all templates (with optional filters)
GET /api/plugins/templates-management/templates
Query params:
  - category: Backend | Frontend | Mobile | Data | etc.
  - complexity: Beginner | Intermediate | Advanced
  - limit: number

# Get template by ID
GET /api/plugins/templates-management/templates/:id

# Create template
POST /api/plugins/templates-management/templates
Body: {
  "name": "Microservices Architecture",
  "description": "Scalable microservices setup",
  "category": "Backend",
  "icon": "🏗️",
  "complexity": "Advanced",
  "tags": ["Docker", "Kubernetes"]
}

# Update template
PUT /api/plugins/templates-management/templates/:id
Body: {
  "description": "Updated description",
  "complexity": "Intermediate"
}

# Delete template
DELETE /api/plugins/templates-management/templates/:id

# Increment usage count
POST /api/plugins/templates-management/templates/:id/use

# Get all categories
GET /api/plugins/templates-management/categories
Response: ["Backend", "Frontend", "Mobile", "Data"]

# Get statistics
GET /api/plugins/templates-management/stats
Response: {
  "total": 6,
  "byCategory": { "Backend": 3, "Frontend": 1, ... },
  "byComplexity": { "Advanced": 3, "Intermediate": 2, ... },
  "totalUsage": 1434
}
```

## Testing Framework

### Stack
- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertion library for testing Express APIs
- **ts-jest**: TypeScript preprocessor for Jest

### Configuration

Jest is configured in `jest.config.js`:
- **Test environment**: Node.js
- **Test location**: `tests/` directory
- **Test pattern**: `**/*.test.ts` and `**/*.spec.ts`
- **Coverage**: Collects from `packages/**/*.ts` and `plugins/**/*.ts`

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/api/projects-backend.test.ts

# Run in watch mode
npm test -- --watch
```

## Test Structure

### Test Setup (`tests/setup.ts`)

Provides utilities for testing:
- `TestServer`: Creates isolated test server instance
- `expectSuccess()`: Validates successful responses
- `expectError()`: Validates error responses
- `expectData()`: Extracts and validates response data

### Example Test

```typescript
import request from 'supertest';
import { TestServer, expectSuccess, expectData } from '../setup';

describe('Projects Backend API', () => {
  let testServer: TestServer;
  let app: any;

  beforeAll(async () => {
    testServer = new TestServer();
    await testServer.setup();
    app = testServer.getApp();
  });

  afterAll(async () => {
    await testServer.teardown();
  });

  describe('GET /api/plugins/projects-backend/projects', () => {
    it('should return list of projects', async () => {
      const response = await request(app)
        .get('/api/plugins/projects-backend/projects')
        .expect(200);

      expectSuccess(response);
      const data = expectData(response);
      expect(Array.isArray(data)).toBe(true);
    });
  });
});
```

## API Documentation (Swagger)

### Overview

Every backend plugin should implement OpenAPI 3.0 specification for automatic API documentation via Swagger UI.

### Implementation

1. **Add `getOpenAPISpec()` method** to your backend plugin:

```typescript
class MyBackendPlugin extends BackendPlugin {
  getOpenAPISpec() {
    return {
      paths: {
        '/api/plugins/my-plugin/endpoint': {
          get: {
            summary: 'Get data',
            tags: ['MyPlugin'],
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean' },
                        data: { type: 'array' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        schemas: {
          MyModel: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' }
            }
          }
        }
      }
    };
  }
}
```

2. **Swagger UI** automatically aggregates all plugin specs and serves them at:
   - **URL**: `http://localhost:3000/api-docs`

### OpenAPI Spec Best Practices

1. **Use tags** to group related endpoints
2. **Define reusable schemas** in `components.schemas`
3. **Document all parameters** (path, query, body)
4. **Specify response codes** (200, 201, 400, 404, 500)
5. **Include examples** in schemas
6. **Use $ref** for schema references

Example:
```typescript
{
  paths: {
    '/api/plugins/projects-backend/projects/{id}': {
      get: {
        summary: 'Get project by ID',
        tags: ['Projects'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Project details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Project' }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Project not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Project: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'My Project' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' }
        }
      }
    }
  }
}
```

## Test Coverage

### Current Status

- **projects-backend**: ✅ 13/13 tests passing
  - GET /projects (with filter)
  - POST /projects (with validation)
  - GET /projects/:id
  - PUT /projects/:id (with validation)
  - DELETE /projects/:id
  - GET /stats

- **activity-backend**: ⏳ Pending
- **templates-backend**: ⏳ Pending

### Writing New Tests

When adding new backend plugins:

1. **Create test file**: `tests/api/{plugin-name}.test.ts`
2. **Test all endpoints**: GET, POST, PUT, DELETE
3. **Test validation**: Required fields, data types, ranges
4. **Test error cases**: 400, 404 responses
5. **Test filters**: Query parameters, pagination
6. **Test edge cases**: Empty data, invalid IDs

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run API Tests
  run: npm test

- name: Upload Coverage
  run: npm test -- --coverage
```

## Next Steps

1. ✅ Implement OpenAPI specs for activity-backend
2. ✅ Implement OpenAPI specs for templates-backend
3. ✅ Create test suites for activity-backend
4. ✅ Create test suites for templates-backend
5. ⏳ Add integration tests
6. ⏳ Add performance tests
7. ⏳ Set up CI/CD test automation
