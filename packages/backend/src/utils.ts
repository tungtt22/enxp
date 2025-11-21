import { Response } from 'express';

/**
 * Standard API response utilities to reduce code duplication
 */
export class ApiResponse {
  /**
   * Send success response with data
   */
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200): Response {
    return res.status(statusCode).json({
      success: true,
      data,
      ...(message && { message }),
    });
  }

  /**
   * Send success response for created resources
   */
  static created<T>(res: Response, data: T, message: string = 'Resource created successfully'): Response {
    return this.success(res, data, message, 201);
  }

  /**
   * Send error response
   */
  static error(res: Response, error: string, statusCode: number = 400): Response {
    return res.status(statusCode).json({
      success: false,
      error,
    });
  }

  /**
   * Send 404 not found response
   */
  static notFound(res: Response, resource: string = 'Resource'): Response {
    return this.error(res, `${resource} not found`, 404);
  }

  /**
   * Send bad request response
   */
  static badRequest(res: Response, error: string): Response {
    return this.error(res, error, 400);
  }

  /**
   * Send server error response
   */
  static serverError(res: Response, error: string = 'Internal server error'): Response {
    return this.error(res, error, 500);
  }

  /**
   * Send list response with total count
   */
  static list<T>(res: Response, data: T[], total?: number): Response {
    return res.json({
      success: true,
      data,
      total: total ?? data.length,
    });
  }
}

/**
 * Validation utilities
 */
export class Validator {
  /**
   * Validate required fields
   */
  static required(fields: Record<string, any>, requiredFields: string[]): string | null {
    const missing = requiredFields.filter(field => !fields[field]);
    if (missing.length > 0) {
      return `Missing required fields: ${missing.join(', ')}`;
    }
    return null;
  }

  /**
   * Validate number range
   */
  static range(value: number, min: number, max: number, fieldName: string = 'Value'): string | null {
    if (value < min || value > max) {
      return `${fieldName} must be between ${min} and ${max}`;
    }
    return null;
  }

  /**
   * Validate enum value
   */
  static enum<T>(value: T, allowedValues: T[], fieldName: string = 'Value'): string | null {
    if (!allowedValues.includes(value)) {
      return `${fieldName} must be one of: ${allowedValues.join(', ')}`;
    }
    return null;
  }
}

/**
 * Common OpenAPI schema definitions
 */
export const CommonSchemas = {
  /**
   * Standard error response schema
   */
  Error: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: { type: 'string', example: 'Error message' },
    },
  },

  /**
   * Standard success response wrapper
   */
  SuccessResponse: (dataSchema: any) => ({
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: dataSchema,
      message: { type: 'string', example: 'Operation successful' },
    },
  }),

  /**
   * Standard list response wrapper
   */
  ListResponse: (itemSchema: any) => ({
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'array',
        items: itemSchema,
      },
      total: { type: 'number', example: 10 },
    },
  }),

  /**
   * Common error responses for OpenAPI
   */
  ErrorResponses: {
    '400': {
      description: 'Bad Request',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '404': {
      description: 'Not Found',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '500': {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
  },
};
