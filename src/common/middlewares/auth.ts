import { Request, Response, NextFunction } from 'express';
import { getUserDetailsFromToken } from '../../utils/jwtUtils';
import { AppError } from '../errors/AppError';

export interface AuthenticatedRequest extends Request {
  user_payload: any;
}

// Express middleware for JWT authentication
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userDetails = await getUserDetailsFromToken(req as AuthenticatedRequest);
    (req as AuthenticatedRequest).user_payload = userDetails;
    next();
  } catch (error: any) {
    next(error);
  }
};

// Alias for backward compatibility
export const isAuthorized = authenticateToken;
