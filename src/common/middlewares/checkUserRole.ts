import { Response, Request, NextFunction } from "express";
import { AppError } from "../errors/AppError";

/**
 * Middleware to check if the authenticated user has the required role
 * @param allowedRoles Array of allowed roles
 */
export const checkUserRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user_payload;

      if (!user) {
        throw AppError.unauthorized("Authentication required");
      }

      if (!allowedRoles.includes(user.role)) {
        throw AppError.forbidden(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to ensure admin, super_admin, hod, and user roles can manage locations
 */
export const requireUserRoleForLocations = checkUserRole(['admin', 'super_admin', 'hod', 'user']);

/**
 * Middleware to ensure admin, super_admin can manage users
 */
export const requireUserRoleForUsers = checkUserRole(['admin', 'super_admin']);

/**
 * Middleware to ensure only admins can perform certain operations
 */
export const requireAdminRole = checkUserRole(['admin', 'super_admin']);

/**
 * Middleware to allow users, admins, and hod roles for read operations
 */
export const requireUserOrAdminRole = checkUserRole(['user', 'admin', 'super_admin', 'hod']);
