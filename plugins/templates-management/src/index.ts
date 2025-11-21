import { Plugin, ExtendedPluginContext } from '@enxp/core';
import { activateServer } from './server';
import { activateClient } from './client';

export class TemplatesPlugin extends Plugin {
  constructor() {
    super('templates-management', 'Templates Management', '1.0.0', {
      description: 'Architecture templates management plugin',
    });
  }

  async activatePlugin(context: ExtendedPluginContext): Promise<void> {
    console.log(`[${context.manifest.id}] Activating Templates Management Plugin...`);

    if (this.isServer(context)) {
      activateServer(context);
    }

    if (this.isClient(context)) {
      activateClient(context);
    }
  }

  async deactivate(): Promise<void> {
    console.log('Templates Management Plugin deactivated');
  }

  /**
   * OpenAPI specification for Templates API
   */
  getOpenAPISpec(): any {
    return {
      paths: {
        '/templates': {
          get: {
            summary: 'Get all templates',
            description: 'Retrieve templates with optional filters',
            parameters: [
              {
                name: 'category',
                in: 'query',
                schema: { type: 'string' }
              },
              {
                name: 'complexity',
                in: 'query',
                schema: { type: 'string', enum: ['Beginner', 'Intermediate', 'Advanced'] }
              },
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer' }
              }
            ],
            responses: {
              '200': {
                description: 'List of templates',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Template' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Create a new template',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/TemplateInput' }
                }
              }
            },
            responses: {
              '201': {
                description: 'Template created',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/Template' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/templates/{id}': {
          get: {
            summary: 'Get template by ID',
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
                description: 'Template details',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/Template' }
                      }
                    }
                  }
                }
              }
            }
          },
          put: {
            summary: 'Update template',
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
                  schema: { $ref: '#/components/schemas/TemplateInput' }
                }
              }
            },
            responses: {
              '200': {
                description: 'Template updated',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/Template' }
                      }
                    }
                  }
                }
              }
            }
          },
          delete: {
            summary: 'Delete template',
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
                description: 'Template deleted',
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
        '/templates/{id}/use': {
          post: {
            summary: 'Increment template usage count',
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
                description: 'Usage count incremented',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/Template' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/categories': {
          get: {
            summary: 'Get all template categories',
            responses: {
              '200': {
                description: 'List of categories',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'array',
                          items: { type: 'string' },
                          example: ['Backend', 'Frontend', 'Mobile', 'Data']
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
            summary: 'Get template statistics',
            description: 'Get aggregated statistics for templates',
            responses: {
              '200': {
                description: 'Template statistics',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/TemplateStats' }
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
          Template: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              name: { type: 'string', example: 'Microservices Architecture' },
              description: { type: 'string', example: 'Scalable microservices setup with Docker and Kubernetes' },
              category: { type: 'string', example: 'Backend' },
              icon: { type: 'string', example: '🏗️' },
              complexity: { type: 'string', enum: ['Beginner', 'Intermediate', 'Advanced'], example: 'Advanced' },
              tags: { type: 'array', items: { type: 'string' }, example: ['Docker', 'Kubernetes', 'Microservices'] },
              usageCount: { type: 'integer', example: 456 },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          },
          TemplateInput: {
            type: 'object',
            required: ['name', 'category', 'complexity'],
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string' },
              icon: { type: 'string' },
              complexity: { type: 'string', enum: ['Beginner', 'Intermediate', 'Advanced'] },
              tags: { type: 'array', items: { type: 'string' } }
            }
          },
          TemplateStats: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 6 },
              byCategory: {
                type: 'object',
                example: { Backend: 3, Frontend: 1, Mobile: 1, Data: 1 }
              },
              byComplexity: {
                type: 'object',
                example: { Advanced: 3, Intermediate: 2, Beginner: 1 }
              },
              totalUsage: { type: 'integer', example: 1434 }
            }
          }
        }
      }
    };
  }
}

export default TemplatesPlugin;
