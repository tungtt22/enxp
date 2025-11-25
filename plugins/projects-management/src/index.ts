import { Plugin, ExtendedPluginContext } from '@enxp/core';
import manifest from '../plugin.json';
import type { RouteDefinition } from '@enxp/frontend';
import { ProjectsDashboard } from './client/ProjectsDashboard';

/**
 * Projects Management Plugin
 * Supports both client and server in single plugin structure
 */
export class ProjectsPlugin extends Plugin {
  constructor() {
    super('projects-management', 'Project Management', '1.0.0', {
      description: 'Manage projects with full CRUD operations',
    });
    this.setManifest(manifest as any);
  }

  /**
   * Register routes for frontend
   */
  registerRoutes(): RouteDefinition[] {
    return [
      {
        path: '/projects',
        component: ProjectsDashboard,
        exact: true,
        meta: {
          title: 'Projects',
          icon: '📁',
        },
      },
    ];
  }

  /**
   * Activate based on environment
   */
  async activatePlugin(context: ExtendedPluginContext): Promise<void> {
    context.logger.info(`Activating ${this.name} in ${context.environment} environment`);

    // Add manifest to context for client/server activation
    const contextWithManifest = { ...context, manifest: this.manifest };

    if (context.environment === 'server') {
      const { activateServer } = await import('./server');
      await activateServer(contextWithManifest as ExtendedPluginContext);
    } else if (context.environment === 'client') {
      const { activateClient } = await import('./client');
      await activateClient(contextWithManifest as ExtendedPluginContext);
    }

    context.logger.info(`${this.name} activated successfully`);
  }

  /**
   * OpenAPI specification for Projects API
   */
  getOpenAPISpec(): any {
    return {
      paths: {
        '/projects': {
          get: {
            summary: 'Get all projects',
            description: 'Retrieve a list of all projects',
            responses: {
              '200': {
                description: 'List of projects',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Project' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Create a new project',
            description: 'Create a new project with name, description, and status',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ProjectInput' }
                }
              }
            },
            responses: {
              '201': {
                description: 'Project created successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/Project' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/projects/{id}': {
          get: {
            summary: 'Get project by ID',
            description: 'Retrieve a specific project by its ID',
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
                        success: { type: 'boolean', example: true },
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
          },
          put: {
            summary: 'Update project',
            description: 'Update an existing project',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'integer' }
              }
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ProjectInput' }
                }
              }
            },
            responses: {
              '200': {
                description: 'Project updated successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/Project' }
                      }
                    }
                  }
                }
              }
            }
          },
          delete: {
            summary: 'Delete project',
            description: 'Delete a project by ID',
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
                description: 'Project deleted successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string' }
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
          Project: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              name: { type: 'string', example: 'Website Redesign' },
              description: { type: 'string', example: 'Complete website overhaul' },
              status: { type: 'string', enum: ['active', 'completed', 'archived'], example: 'active' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          },
          ProjectInput: {
            type: 'object',
            required: ['name', 'status'],
            properties: {
              name: { type: 'string', example: 'New Project' },
              description: { type: 'string', example: 'Project description' },
              status: { type: 'string', enum: ['active', 'completed', 'archived'], example: 'active' }
            }
          }
        }
      }
    };
  }
}

// Default export for class-based loading
export default ProjectsPlugin;
