import { Plugin, ExtendedPluginContext } from '@enxp/core';
import { activateServer } from './server';
import { activateClient } from './client';

export class ActivityPlugin extends Plugin {
  constructor() {
    super('activity-management', 'Activity Management', '1.0.0', {
      description: 'Activity tracking and monitoring plugin',
    });
  }

  async activatePlugin(context: ExtendedPluginContext): Promise<void> {
    console.log(`[${context.manifest.id}] Activating Activity Management Plugin...`);

    if (this.isServer(context)) {
      activateServer(context);
    }

    if (this.isClient(context)) {
      activateClient(context);
    }
  }

  async deactivate(): Promise<void> {
    console.log('Activity Management Plugin deactivated');
  }

  /**
   * OpenAPI specification for Activity API
   */
  getOpenAPISpec(): any {
    return {
      paths: {
        '/activities': {
          get: {
            summary: 'Get all activities',
            description: 'Retrieve activities with optional filters',
            parameters: [
              {
                name: 'type',
                in: 'query',
                schema: { type: 'string', enum: ['deployment', 'build', 'commit', 'review', 'issue'] }
              },
              {
                name: 'status',
                in: 'query',
                schema: { type: 'string', enum: ['success', 'failed', 'pending', 'in_progress'] }
              }
            ],
            responses: {
              '200': {
                description: 'List of activities',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Activity' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Create a new activity',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ActivityInput' }
                }
              }
            },
            responses: {
              '201': {
                description: 'Activity created',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/Activity' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/activities/{id}': {
          get: {
            summary: 'Get activity by ID',
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
                description: 'Activity details',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/Activity' }
                      }
                    }
                  }
                }
              }
            }
          },
          put: {
            summary: 'Update activity',
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
                  schema: { $ref: '#/components/schemas/ActivityInput' }
                }
              }
            },
            responses: {
              '200': {
                description: 'Activity updated',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/Activity' }
                      }
                    }
                  }
                }
              }
            }
          },
          delete: {
            summary: 'Delete activity',
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
                description: 'Activity deleted',
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
        },
        '/stats': {
          get: {
            summary: 'Get activity statistics',
            description: 'Get aggregated statistics for activities',
            responses: {
              '200': {
                description: 'Activity statistics',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/ActivityStats' }
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
          Activity: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              type: { type: 'string', enum: ['deployment', 'build', 'commit', 'review', 'issue'], example: 'deployment' },
              status: { type: 'string', enum: ['success', 'failed', 'pending', 'in_progress'], example: 'success' },
              title: { type: 'string', example: 'Deploy to Production' },
              description: { type: 'string', example: 'Deployed version 1.2.0' },
              metadata: { type: 'object', example: { version: '1.2.0', environment: 'production' } },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          },
          ActivityInput: {
            type: 'object',
            required: ['type', 'status', 'title'],
            properties: {
              type: { type: 'string', enum: ['deployment', 'build', 'commit', 'review', 'issue'] },
              status: { type: 'string', enum: ['success', 'failed', 'pending', 'in_progress'] },
              title: { type: 'string' },
              description: { type: 'string' },
              metadata: { type: 'object' }
            }
          },
          ActivityStats: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 5 },
              byType: {
                type: 'object',
                example: { deployment: 1, build: 1, commit: 2, review: 1 }
              },
              byStatus: {
                type: 'object',
                example: { success: 3, pending: 1, failed: 1 }
              }
            }
          }
        }
      }
    };
  }
}

export default ActivityPlugin;
