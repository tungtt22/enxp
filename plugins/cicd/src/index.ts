import { Plugin, ExtendedPluginContext } from '@enxp/core';
import manifest from '../plugin.json';
import { routes as cicdRoutes } from './routes';

/**
 * CICD Plugin - CI/CD Pipeline Management
 */
export class CicdPlugin extends Plugin {
  constructor() {
    super('cicd', 'CI/CD Management', '1.0.0', {
      description: 'CI/CD Pipeline Management Plugin',
    });
    // Load manifest for contributions
    this.setManifest(manifest as any);
  }

  /**
   * Register routes for frontend
   */
  registerRoutes() {
    return cicdRoutes;
  }

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
   * OpenAPI specification for Swagger documentation
   */
  getOpenAPISpec(): any {
    return {
      paths: {
        '/pipelines': {
          get: {
            summary: 'Get all pipelines',
            description: 'Retrieve a list of all CI/CD pipelines',
            parameters: [
              {
                name: 'status',
                in: 'query',
                schema: { type: 'string', enum: ['running', 'success', 'failed', 'pending'] },
                description: 'Filter by pipeline status'
              }
            ],
            responses: {
              '200': {
                description: 'List of pipelines',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Pipeline' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Create pipeline',
            description: 'Create a new CI/CD pipeline',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PipelineInput' }
                }
              }
            },
            responses: {
              '201': {
                description: 'Pipeline created',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/Pipeline' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/pipelines/{id}': {
          get: {
            summary: 'Get pipeline by ID',
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
                description: 'Pipeline details',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean' },
                        data: { $ref: '#/components/schemas/Pipeline' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/pipelines/{id}/run': {
          post: {
            summary: 'Trigger pipeline',
            description: 'Manually trigger a pipeline execution',
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
                description: 'Pipeline triggered',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string', example: 'Pipeline triggered' },
                        executionId: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/executions': {
          get: {
            summary: 'Get pipeline executions',
            description: 'Get execution history',
            responses: {
              '200': {
                description: 'List of executions',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean' },
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Execution' }
                        }
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
            summary: 'Get CI/CD statistics',
            responses: {
              '200': {
                description: 'Statistics',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean' },
                        data: { $ref: '#/components/schemas/Stats' }
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
          Pipeline: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              name: { type: 'string', example: 'Build and Deploy' },
              repository: { type: 'string', example: 'https://github.com/user/repo' },
              branch: { type: 'string', example: 'main' },
              status: { type: 'string', enum: ['running', 'success', 'failed', 'pending'] },
              lastRun: { type: 'string', format: 'date-time' },
              duration: { type: 'integer', example: 120 },
              createdAt: { type: 'string', format: 'date-time' }
            }
          },
          PipelineInput: {
            type: 'object',
            required: ['name', 'repository', 'branch'],
            properties: {
              name: { type: 'string' },
              repository: { type: 'string' },
              branch: { type: 'string', default: 'main' },
              steps: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          },
          Execution: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              pipelineId: { type: 'integer' },
              status: { type: 'string', enum: ['running', 'success', 'failed'] },
              startedAt: { type: 'string', format: 'date-time' },
              finishedAt: { type: 'string', format: 'date-time' },
              duration: { type: 'integer' },
              logs: { type: 'string' }
            }
          },
          Stats: {
            type: 'object',
            properties: {
              totalPipelines: { type: 'integer' },
              totalExecutions: { type: 'integer' },
              successRate: { type: 'number', format: 'float' },
              avgDuration: { type: 'integer' },
              byStatus: {
                type: 'object',
                properties: {
                  running: { type: 'integer' },
                  success: { type: 'integer' },
                  failed: { type: 'integer' },
                  pending: { type: 'integer' }
                }
              }
            }
          }
        }
      }
    };
  }
}

export default CicdPlugin;
