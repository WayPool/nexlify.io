/**
 * Global error handler middleware.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error
  logger.error('Request error', err, {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  // Zod validation error
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      code: 'VALIDATION_ERROR',
      details: err.errors,
    });
    return;
  }

  // Known application error
  if (err.statusCode) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code || 'ERROR',
      details: err.details,
    });
    return;
  }

  // Unknown error
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}

/**
 * Create an application error.
 */
export function createError(
  message: string,
  statusCode: number,
  code?: string,
  details?: unknown
): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

// Common error creators
export const errors = {
  notFound: (resource: string) =>
    createError(`${resource} not found`, 404, 'NOT_FOUND'),

  unauthorized: (message = 'Unauthorized') =>
    createError(message, 401, 'UNAUTHORIZED'),

  forbidden: (message = 'Access denied') =>
    createError(message, 403, 'FORBIDDEN'),

  badRequest: (message: string, details?: unknown) =>
    createError(message, 400, 'BAD_REQUEST', details),

  conflict: (message: string) =>
    createError(message, 409, 'CONFLICT'),

  tooManyRequests: (message = 'Too many requests') =>
    createError(message, 429, 'TOO_MANY_REQUESTS'),
};
