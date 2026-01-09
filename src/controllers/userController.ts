import { Response, Request, NextFunction } from 'express';
import mongoose from 'mongoose';
import {
  USER_MGMT_CREATED,
  USER_MGMT_UPDATED,
  USER_MGMT_DELETED,
  USER_MGMT_FETCHED,
  USERS_MGMT_FETCHED,
  USER_MGMT_NOT_FOUND,
  USER_MGMT_VALIDATION_ERROR
} from '../constants/appMessages';
import UserService from '../services/db/userService';
import UserDao from '../dao/userDao';
import { AppError } from '../common/errors/AppError';
import { sendSuccessResp, sendPaginatedResponse } from '../utils/respUtils';
import { safeParseAsync, flatten } from 'valibot';
import { VCreateUserSchema, VUpdateUserSchema } from '../validations/schema/vUserManagementSchema';

class UserController {
  private userService = new UserService();
  private userDao = new UserDao();

  /**
   * Create new user
   */
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user_payload;
      const requestData = req.body;

      // Basic data presence check
      if (!requestData) {
        throw AppError.badRequest('User data is required');
      }

      // Set active to true by default if not provided
      requestData.active = requestData.active !== undefined ? requestData.active : "true";

      // Validate request data
      const validation = await safeParseAsync(VCreateUserSchema, requestData, {
        abortPipeEarly: false,
      });

      if (!validation.success) {
        const errors = flatten(validation.issues).nested;
        throw AppError.badRequest(`${USER_MGMT_VALIDATION_ERROR}: ${JSON.stringify(errors)}`);
      }

      // Create user
      const createdUser = await this.userService.createUser(validation.output, user._id);

      return sendSuccessResp(res, 201, USER_MGMT_CREATED, createdUser, req);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user by ID
   */
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      console.log("🚀 ~ UserController ~ getUserById ~ id:", id)

      if (!id) {
        throw AppError.badRequest('User ID is required');
      }

      const userRecord = await this.userService.getUserWithDetails(id);

      if (!userRecord) {
        throw AppError.notFound(USER_MGMT_NOT_FOUND);
      }

      return sendSuccessResp(res, 200, USER_MGMT_FETCHED, userRecord, req);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current user's profile
   */
  getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user_payload;

      const userRecord = await this.userService.getUserWithDetails(user._id);

      if (!userRecord) {
        throw AppError.notFound(USER_MGMT_NOT_FOUND);
      }

      return sendSuccessResp(res, 200, USER_MGMT_FETCHED, userRecord, req);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get users with pagination
   */
  getUsersPaginated = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = +(req.query.page as string) || 1;
      const pageSize = +(req.query.page_size as string) || 10;
      const searchString = req.query.search_string as string | undefined;
      const organizationId = req.query.organization_id as string | undefined;
      const departmentId = req.query.department_id as string | undefined;
      const roleId = req.query.role_id as string | undefined;
      const status = req.query.status as string | undefined;

      const query = {
        page,
        pageSize,
        searchString,
        organizationId,
        departmentId,
        roleId,
        status
      };

      // Use DAO with aggregation to include organization/department/role data
      const result = await this.userDao.getUsersWithDetails(query);

      return sendPaginatedResponse(res, USERS_MGMT_FETCHED, result.records, result.pagination_info, req);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all users without pagination
   */
  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getAllUsers();

      return sendSuccessResp(res, 200, USERS_MGMT_FETCHED, users, req);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user by ID
   */
  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = (req as any).user_payload;
      const requestData = req.body;

      if (!id) {
        throw AppError.badRequest('User ID is required');
      }

      if (!requestData || Object.keys(requestData).length === 0) {
        throw AppError.badRequest('At least one field must be provided for update');
      }

      // Validate request data
      const validation = await safeParseAsync(VUpdateUserSchema, requestData, {
        abortPipeEarly: false,
      });

      if (!validation.success) {
        const errors = flatten(validation.issues).nested;
        throw AppError.badRequest(`${USER_MGMT_VALIDATION_ERROR}: ${JSON.stringify(errors)}`);
      }

      // Update user
      const updatedUser = await this.userService.updateUser(id, validation.output, user._id);

      return sendSuccessResp(res, 200, USER_MGMT_UPDATED, updatedUser, req);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete user (soft delete)
   */
  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = (req as any).user_payload;

      if (!id) {
        throw AppError.badRequest('User ID is required');
      }

      await this.userService.deleteUser(id, user._id);

      return sendSuccessResp(res, 200, USER_MGMT_DELETED, { id }, req);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get users by organization
   */
  getUsersByOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;

      if (!organizationId) {
        throw AppError.badRequest('Organization ID is required');
      }

      const users = await this.userService.getUsersByOrganization(organizationId);

      return sendSuccessResp(res, 200, USERS_MGMT_FETCHED, users, req);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get users by department
   */
  getUsersByDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { departmentId } = req.params;

      if (!departmentId) {
        throw AppError.badRequest('Department ID is required');
      }

      const users = await this.userService.getUsersByDepartment(departmentId);

      return sendSuccessResp(res, 200, USERS_MGMT_FETCHED, users, req);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get users by role
   */
  getUsersByRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roleId } = req.params;

      if (!roleId) {
        throw AppError.badRequest('Role ID is required');
      }

      const users = await this.userService.getUsersByRole(roleId);

      return sendSuccessResp(res, 200, USERS_MGMT_FETCHED, users, req);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset user password by admin
   */
  resetPasswordByAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = (req as any).user_payload;

      if (!id) {
        throw AppError.badRequest('User ID is required');
      }

      // Generate new random password
      const newPassword = this.userService.generateRandomPassword();

      // Hash the password
      const hashedPassword = await this.userService.hashPassword(newPassword);

      // Update user password (this will automatically log the activity)
      await this.userService.updateUser(id, { password: hashedPassword }, user._id);

      return sendSuccessResp(res, 200, 'Password reset successfully', { id }, req);
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
