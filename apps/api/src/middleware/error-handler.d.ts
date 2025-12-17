/**
 * Global error handler middleware.
 */
import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    code?: string;
    details?: unknown;
}
export declare function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction): void;
/**
 * Create an application error.
 */
export declare function createError(message: string, statusCode: number, code?: string, details?: unknown): AppError;
export declare const errors: {
    notFound: (resource: string) => AppError;
    unauthorized: (message?: string) => AppError;
    forbidden: (message?: string) => AppError;
    badRequest: (message: string, details?: unknown) => AppError;
    conflict: (message: string) => AppError;
    tooManyRequests: (message?: string) => AppError;
};
//# sourceMappingURL=error-handler.d.ts.map