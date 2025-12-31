export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    type: ErrorType,
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  // Static factory methods for common errors
  static validationError(message: string, details?: any): AppError {
    return new AppError(ErrorType.VALIDATION_ERROR, message, 422, true, details);
  }

  static notFound(message: string = 'Resource not found'): AppError {
    return new AppError(ErrorType.NOT_FOUND, message, 404, true);
  }

  static unauthorized(message: string = 'Unauthorized'): AppError {
    return new AppError(ErrorType.UNAUTHORIZED, message, 401, true);
  }

  static forbidden(message: string = 'Forbidden'): AppError {
    return new AppError(ErrorType.FORBIDDEN, message, 403, true);
  }

  static conflict(message: string, details?: any): AppError {
    return new AppError(ErrorType.CONFLICT, message, 409, true, details);
  }

  static badRequest(message: string, details?: any): AppError {
    return new AppError(ErrorType.BAD_REQUEST, message, 400, true, details);
  }

  static internal(message: string = 'Internal server error', details?: any): AppError {
    return new AppError(ErrorType.INTERNAL_SERVER_ERROR, message, 500, false, details);
  }
}
