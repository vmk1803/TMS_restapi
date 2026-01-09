import { Response, Request, NextFunction } from 'express';
import {
  USERS_MGMT_FETCHED
} from '../constants/appMessages';
import User from '../models/User';
import Department from '../models/Department';
import Group from '../models/Group';
import { AppError } from '../common/errors/AppError';
import { sendSuccessResp } from '../utils/respUtils';
import { asyncHandler } from '../common/middlewares/errorHandler';
import { UserStatistics } from '../types/app.types';

class StatisticsController {

  /**
   * Get user management statistics
   */
  getUserStatistics = asyncHandler(async (req: Request, res: Response) => {
    try {
      // Count total users
      const totalUsers = await User.countDocuments({ deletedAt: null });
      
      // Count active users
      const activeUsers = await User.countDocuments({ 
        deletedAt: null, 
        active: true 
      });
      
      // Count inactive users
      const inactiveUsers = await User.countDocuments({ 
        deletedAt: null, 
        active: false 
      });
      
      // Count total departments
      const totalDepartments = await Department.countDocuments({});
      
      // Count total groups
      const totalGroups = await Group.countDocuments({ deletedAt: null });
      
      const statistics: UserStatistics = {
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalGroups,
        totalDepartments
      };

      return sendSuccessResp(res, 200, USERS_MGMT_FETCHED, statistics, req);
    } catch (error) {
      throw AppError.internal('Failed to fetch user statistics');
    }
  });
}

export default StatisticsController;