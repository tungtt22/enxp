import { BasePlugin } from '@enxp/core';
import { PluginContext } from '@enxp/core';

/**
 * Backend-specific plugin capabilities
 */
export interface IBackendPlugin {
  /** Register API routes */
  registerRoutes?(router: any): void;
  
  /** Register middleware */
  registerMiddleware?(app: any): void;
  
  /** Register database models */
  registerModels?(): void;
  
  /** Register services */
  registerServices?(): void;
  
  /** Register event handlers */
  registerEventHandlers?(): void;

  /** Get OpenAPI specification for this plugin */
  getOpenAPISpec?(): any;
}

/**
 * Base class for backend plugins
 */
export abstract class BackendPlugin extends BasePlugin implements IBackendPlugin {
  constructor(
    id: string,
    name: string,
    version: string,
    options?: {
      description?: string;
      dependencies?: string[];
    }
  ) {
    super(id, name, version, 'backend', options);
  }

  /**
   * Override to register API routes
   */
  registerRoutes?(router: any): void;

  /**
   * Override to register middleware
   */
  registerMiddleware?(app: any): void;

  /**
   * Override to register database models
   */
  registerModels?(): void;

  /**
   * Override to register services
   */
  registerServices?(): void;

  /**
   * Override to register event handlers
   */
  registerEventHandlers?(): void;

  /**
   * Override to provide OpenAPI specification
   */
  getOpenAPISpec?(): any;

  protected async onActivate(): Promise<void> {
    // Register backend components
    if (this.registerModels) {
      this.registerModels();
    }
    
    if (this.registerServices) {
      this.registerServices();
    }
    
    if (this.registerEventHandlers) {
      this.registerEventHandlers();
    }

    await super.onActivate();
  }
}

/**
 * API Route definition
 */
export interface APIRoute {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  handler: (req: any, res: any, next?: any) => Promise<any> | any;
  middleware?: any[];
  description?: string;
  tags?: string[];
  requestBody?: any;
  responses?: any;
}

/**
 * Service interface
 */
export interface IService {
  name: string;
  initialize?(): Promise<void>;
  destroy?(): Promise<void>;
}

/**
 * Database Model interface
 */
export interface IModel {
  name: string;
  schema: any;
}
