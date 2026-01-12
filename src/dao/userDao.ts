import mongoose from 'mongoose';
import { BaseService, PaginatedResult } from '../services/BaseService';
import User, { IUser } from '../models/User';
import { AppError } from '../common/errors/AppError';
import { isValidObjectId, validatePaginationParams } from '../common/utils/validationHelpers';

export interface UserServiceQuery {
  page?: number;
  pageSize?: number;
  searchString?: string;
  organizationId?: string;
  departmentId?: string;
  roleId?: string;
  status?: string;
}

export interface PaginatedUsersResult {
  pagination_info: {
    total_records: number;
    total_pages: number;
    page_size: number;
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
  };
  records: any[];
}

class UserDao extends BaseService<IUser> {
  constructor() {
    super(User);
  }

  /**
   * Get users with pagination and organization/department/role details
   */
  async getUsersWithDetails(query: UserServiceQuery): Promise<PaginatedUsersResult> {
    try {
      const { page = 1, pageSize = 10, searchString = '', organizationId, departmentId, roleId, status } = query;

      // Validate pagination
      validatePaginationParams(page, pageSize);

      // Build filter
      const filter: any = { deletedAt: null };

      // Search in name (prefix regex) or email (partial regex)
      if (searchString) {
        filter.$or = [
          { firstName: { $regex: `^${searchString}`, $options: 'i' } },
          { lastName: { $regex: `^${searchString}`, $options: 'i' } },
          { email: { $regex: searchString, $options: 'i' } }
        ];
      }

      // Filter by organization
      if (organizationId && isValidObjectId(organizationId)) {
        filter['organizationDetails.organization'] = new mongoose.Types.ObjectId(organizationId);
      }

      // Filter by department
      if (departmentId && isValidObjectId(departmentId)) {
        filter['organizationDetails.department'] = new mongoose.Types.ObjectId(departmentId);
      }

      // Filter by role
      if (roleId && isValidObjectId(roleId)) {
        filter['organizationDetails.role'] = new mongoose.Types.ObjectId(roleId);
      }

      // Filter by status (active/inactive)
      if (status && status !== 'all') {
        if (status === 'active') {
          filter.active = true;
        } else if (status === 'inactive') {
          filter.active = false;
        }
      }

      // Get total count
      const totalRecords = await this.model.countDocuments(filter);
      const totalPages = Math.ceil(totalRecords / pageSize);
      const skip = (page - 1) * pageSize;

      // Get paginated data with populated references
      const records = await this.model
        .find(filter)
        .populate('organizationDetails.role', 'name')
        .populate('organizationDetails.department', 'name')
        .populate('organizationDetails.organization', 'organizationName')
        .populate('organizationDetails.location', 'city country')
        .populate('organizationDetails.reportingManager', 'firstName lastName email')
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 });

      const nextPage = page < totalPages ? page + 1 : null;
      const prevPage = page > 1 ? page - 1 : null;

      return {
        records,
        pagination_info: {
          total_records: totalRecords,
          total_pages: totalPages,
          page_size: pageSize,
          current_page: page,
          next_page: nextPage,
          prev_page: prevPage
        }
      };
    } catch (error: any) {
      throw this.handleError(error, 'getUsersWithDetails');
    }
  }

  /**
   * Get user by ID with populated references
   */
  async getUserWithDetails(id: string): Promise<IUser | null> {
    try {
      if (!isValidObjectId(id)) {
        throw AppError.badRequest('Invalid user ID');
      }

      const user = await this.model
        .findOne({ _id: id, deletedAt: null })
        .populate('organizationDetails.role')
        .populate('organizationDetails.department')
        .populate('organizationDetails.organization')
        .populate('organizationDetails.location')
        .populate('organizationDetails.reportingManager', 'firstName lastName email')
        .exec();

      return user;
    } catch (error: any) {
      throw this.handleError(error, 'getUserWithDetails');
    }
  }

  /**
   * Check if email already exists
   */
  async emailExists(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      const filter: any = { email: email.toLowerCase(), deletedAt: null };

      if (excludeUserId && isValidObjectId(excludeUserId)) {
        filter._id = { $ne: new mongoose.Types.ObjectId(excludeUserId) };
      }

      const count = await this.model.countDocuments(filter);
      return count > 0;
    } catch (error: any) {
      throw this.handleError(error, 'emailExists');
    }
  }

  /**
   * Get users by organization
   */
  async getUsersByOrganization(organizationId: string): Promise<IUser[]> {
    try {
      if (!isValidObjectId(organizationId)) {
        throw AppError.badRequest('Invalid organization ID');
      }

      const users = await this.model
        .find({
          'organizationDetails.organization': new mongoose.Types.ObjectId(organizationId),
          deletedAt: null
        })
        .populate('organizationDetails.role')
        .populate('organizationDetails.department')
        .populate('organizationDetails.location')
        .exec();

      return users;
    } catch (error: any) {
      throw this.handleError(error, 'getUsersByOrganization');
    }
  }

  /**
   * Get users by department
   */
  async getUsersByDepartment(departmentId: string): Promise<IUser[]> {
    try {
      if (!isValidObjectId(departmentId)) {
        throw AppError.badRequest('Invalid department ID');
      }

      const users = await this.model
        .find({
          'organizationDetails.department': new mongoose.Types.ObjectId(departmentId),
          deletedAt: null
        })
        .populate('organizationDetails.role')
        .populate('organizationDetails.organization')
        .populate('organizationDetails.location')
        .exec();

      return users;
    } catch (error: any) {
      throw this.handleError(error, 'getUsersByDepartment');
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(roleId: string): Promise<IUser[]> {
    try {
      if (!isValidObjectId(roleId)) {
        throw AppError.badRequest('Invalid role ID');
      }

      const users = await this.model
        .find({
          'organizationDetails.role': new mongoose.Types.ObjectId(roleId),
          deletedAt: null
        })
        .populate('organizationDetails.department')
        .populate('organizationDetails.organization')
        .populate('organizationDetails.location')
        .exec();

      return users;
    } catch (error: any) {
      throw this.handleError(error, 'getUsersByRole');
    }
  }

  /**
   * Soft delete user
   */
  async softDeleteUser(userId: string): Promise<IUser | null> {
    try {
      if (!isValidObjectId(userId)) {
        throw AppError.badRequest('Invalid user ID');
      }

      const user = await this.model.findByIdAndUpdate(
        userId,
        { deletedAt: new Date() },
        { new: true }
      );

      return user;
    } catch (error: any) {
      throw this.handleError(error, 'softDeleteUser');
    }
  }

  /**
   * Get all users for CSV export without pagination
   */
  async getUsersForExport(query: Omit<UserServiceQuery, 'page' | 'pageSize'>): Promise<any[]> {
    try {
      const { searchString = '', organizationId, departmentId, roleId, status } = query;

      // Build filter
      const filter: any = { deletedAt: null };

      // Search in name (prefix regex) or email (partial regex)
      if (searchString) {
        filter.$or = [
          { firstName: { $regex: `^${searchString}`, $options: 'i' } },
          { lastName: { $regex: `^${searchString}`, $options: 'i' } },
          { fname: { $regex: `^${searchString}`, $options: 'i' } },
          { lname: { $regex: `^${searchString}`, $options: 'i' } },
          { email: { $regex: searchString, $options: 'i' } }
        ];
      }

      // Organization filter
      if (organizationId && isValidObjectId(organizationId)) {
        filter['organizationDetails.organization'] = new mongoose.Types.ObjectId(organizationId);
      }

      // Department filter
      if (departmentId && isValidObjectId(departmentId)) {
        filter['organizationDetails.department'] = new mongoose.Types.ObjectId(departmentId);
      }

      // Role filter
      if (roleId && isValidObjectId(roleId)) {
        filter['organizationDetails.role'] = new mongoose.Types.ObjectId(roleId);
      }

      // Status filter
      if (status && status !== 'all') {
        filter.active = status === 'active';
      }

      // Aggregation pipeline for export
      const pipeline: any[] = [
        { $match: filter },
        {
          $lookup: {
            from: 'organizations',
            localField: 'organizationDetails.organization',
            foreignField: '_id',
            as: 'organizationDetails.organization'
          }
        },
        {
          $lookup: {
            from: 'departments',
            localField: 'organizationDetails.department',
            foreignField: '_id',
            as: 'organizationDetails.department'
          }
        },
        {
          $lookup: {
            from: 'roles',
            localField: 'organizationDetails.role',
            foreignField: '_id',
            as: 'organizationDetails.role'
          }
        },
        {
          $unwind: {
            path: '$organizationDetails.organization',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$organizationDetails.department',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$organizationDetails.role',
            preserveNullAndEmptyArrays: true
          }
        },
        { $sort: { createdAt: -1 } }
      ];

      const users = await this.model.aggregate(pipeline);
      return users;
    } catch (error: any) {
      throw this.handleError(error, 'getUsersForExport');
    }
  }
}

export default UserDao;
