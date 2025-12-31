import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

// Middleware to validate ObjectId format in route parameters
export const validateObjectId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const paramValue = req.params[paramName];

    if (!paramValue) {
      return next(AppError.badRequest(`${paramName} parameter is required`));
    }

    if (!isValidObjectId(paramValue)) {
      return next(AppError.badRequest(`Invalid ${paramName} format`));
    }

    next();
  };
};

// Extract and validate pagination parameters
export const parsePaginationQuery = (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.page_size as string, 10) || 10;
  const searchString = req.query.search_string as string;

  // Validate pagination parameters
  if (page < 1) {
    return next(AppError.badRequest('Page must be greater than 0'));
  }

  if (pageSize < 1 || pageSize > 100) {
    return next(AppError.badRequest('Page size must be between 1 and 100'));
  }

  if (searchString && searchString.length < 2) {
    return next(AppError.badRequest('Search string must be at least 2 characters long'));
  }

  // Attach parsed parameters to request
  (req as any).pagination = { page, pageSize, searchString };

  next();
};

// Validate required fields in request body
export const validateRequiredFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields: string[] = [];

    fields.forEach(field => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return next(AppError.badRequest(`Missing required fields: ${missingFields.join(', ')}`));
    }

    next();
  };
};

// Validate array fields
export const validateArrayField = (fieldName: string, minLength: number = 1) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const field = req.body[fieldName];

    if (!field || !Array.isArray(field)) {
      return next(AppError.badRequest(`${fieldName} must be an array`));
    }

    if (field.length < minLength) {
      return next(AppError.badRequest(`${fieldName} must contain at least ${minLength} item(s)`));
    }

    next();
  };
};

// Helper function for ObjectId validation
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
