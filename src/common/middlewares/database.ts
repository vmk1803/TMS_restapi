import { Request, Response, NextFunction } from 'express';
import { ensureDBConnection } from '../../config/mongoConfig';
import { asyncHandler } from './errorHandler';

// Global middleware to ensure database connection before any API call
export const ensureDBConnectionMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  await ensureDBConnection();
  next();
});
