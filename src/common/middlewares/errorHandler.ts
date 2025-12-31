import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorType } from '../errors/AppError';
import { customLogger } from '../../utils/logger';

interface ErrorResponse {
  success: false;
  message: string;
  type?: ErrorType;
  details?: any;
  stack?: string;
}

// Global error handling middleware
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  let statusCode = 500;
  let message = 'Internal server error';
  let type = ErrorType.INTERNAL_SERVER_ERROR;
  let details: any = undefined;

  // Check if it's our custom AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    type = error.type;
    details = error.details;
  } else {
    // Handle other types of errors
    if (error.name === 'ValidationError') {
      // Mongoose validation error
      statusCode = 400;
      message = 'Validation failed';
      type = ErrorType.BAD_REQUEST;
      details = error.message;
    } else if (error.name === 'CastError') {
      // Mongoose cast error (invalid ObjectId)
      statusCode = 400;
      message = 'Invalid resource ID';
      type = ErrorType.BAD_REQUEST;
    } else if (error.name === 'MongoError' && (error as any).code === 11000) {
      // MongoDB duplicate key error
      statusCode = 409;
      message = 'Resource already exists';
      type = ErrorType.CONFLICT;
    }
  }

  // Log the error
  customLogger(statusCode, {
    message,
    type,
    details,
    stack: error.stack,
    url: req.url,
    method: req.method,
    user: (req as any).user?.id || 'anonymous'
  }, message, (req as any).user);

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    message,
    type,
  };

  // Include details in development mode or for operational errors
  // Temporarily always show details for debugging
  if (process.env.NODE_ENV === 'development' || (error instanceof AppError && error.isOperational) || true) {
    errorResponse.details = details;
  }

  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  return res.status(statusCode).json(errorResponse);
};

// Async error wrapper to catch async errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(
    ErrorType.NOT_FOUND,
    `Route ${req.originalUrl} not found`,
    404
  );
  next(error);
};
