import { Response, Request, NextFunction } from 'express';
import {
  USERS_MGMT_FETCHED,
  USER_TRENDS_FETCHED,
  USERS_BY_DEPARTMENT_FETCHED
} from '../constants/appMessages';
import User from '../models/User';
import Department from '../models/Department';
import Group from '../models/Group';
import Role from '../models/Role';
import Organization from '../models/Organization';
import { AppError } from '../common/errors/AppError';
import { sendSuccessResp } from '../utils/respUtils';
import { asyncHandler } from '../common/middlewares/errorHandler';
import {
  UserStatistics,
  MonthlyUserData,
  EnhancedUserStatistics,
  RecentUser,
  RoleBreakdown,
  OrganizationOverview,
  ChangeMetrics,
  UserTrendsResponse,
  UsersByDepartmentResponse,
  DepartmentUserCount
} from '../types/app.types';
import mongoose from 'mongoose';

class StatisticsController {

  /**
   * Get user counts (total, active, inactive)
   */
  private async getUserCounts() {
    const totalUsers = await User.countDocuments({ deletedAt: null });
    const activeUsers = await User.countDocuments({
      deletedAt: null,
      active: true
    });
    const inactiveUsers = await User.countDocuments({
      deletedAt: null,
      active: false
    });

    return { totalUsers, activeUsers, inactiveUsers };
  }

  /**
   * Get department and group counts
   */
  private async getDepartmentAndGroupCounts() {
    const totalDepartments = await Department.countDocuments({});
    const totalGroups = await Group.countDocuments({ deletedAt: null });

    return { totalDepartments, totalGroups };
  }

  /**
   * Get recently added users (last 30 days)
   */
  private async getRecentlyAddedUsers(): Promise<RecentUser[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsersAggregation = await User.aggregate([
      {
        $match: {
          deletedAt: null,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $lookup: {
          from: 'roles',
          localField: 'organizationDetails.role',
          foreignField: '_id',
          as: 'roleDetails'
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'organizationDetails.department',
          foreignField: '_id',
          as: 'departmentDetails'
        }
      },
      {
        $lookup: {
          from: 'organizations',
          localField: 'organizationDetails.organization',
          foreignField: '_id',
          as: 'organizationDetails_lookup'
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          createdAt: 1,
          roleName: { $arrayElemAt: ['$roleDetails.name', 0] },
          departmentName: { $arrayElemAt: ['$departmentDetails.name', 0] },
          organizationName: { $arrayElemAt: ['$organizationDetails_lookup.organizationName', 0] }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 10
      }
    ]);

    return recentUsersAggregation.map(user => ({
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleName: user.roleName,
      departmentName: user.departmentName,
      organizationName: user.organizationName,
      createdAt: user.createdAt
    }));
  }

  /**
   * Get role breakdown with percentages
   */
  private async getRoleBreakdown(totalUsers: number, year?: number): Promise<RoleBreakdown[]> {
    const matchConditions: any = { deletedAt: null, 'organizationDetails.role': { $exists: true } };
    
    // Add year filtering if provided
    if (year) {
      matchConditions.createdAt = {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31, 23, 59, 59),
      };
    }

    const roleBreakdownAggregation = await User.aggregate([
      {
        $match: matchConditions
      },
      {
        $group: {
          _id: '$organizationDetails.role',
          userCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'roles',
          localField: '_id',
          foreignField: '_id',
          as: 'roleDetails'
        }
      },
      {
        $project: {
          roleId: '$_id',
          roleName: { $arrayElemAt: ['$roleDetails.name', 0] },
          userCount: 1
        }
      },
      {
        $sort: { userCount: -1 }
      }
    ]);

    return roleBreakdownAggregation.map(role => ({
      roleId: role.roleId.toString(),
      roleName: role.roleName || 'Unknown',
      userCount: role.userCount,
      percentage: totalUsers > 0 ? Math.round((role.userCount / totalUsers) * 100) : 0
    }));
  }

  /**
   * Get organizations overview
   */
  private async getOrganizationsOverviewData(year?: number): Promise<OrganizationOverview[]> {
    const matchConditions: any = { deletedAt: null, 'organizationDetails.organization': { $exists: true } };
    
    // Add year filtering if provided
    if (year) {
      matchConditions.createdAt = {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31, 23, 59, 59),
      };
    }

    const organizationsOverviewAggregation = await User.aggregate([
      {
        $match: matchConditions
      },
      {
        $group: {
          _id: '$organizationDetails.organization',
          userCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'organizations',
          localField: '_id',
          foreignField: '_id',
          as: 'organizationDetails'
        }
      },
      {
        $project: {
          organizationId: '$_id',
          organizationName: { $arrayElemAt: ['$organizationDetails.organizationName', 0] },
          userCount: 1
        }
      },
      {
        $sort: { userCount: -1 }
      }
    ]);

    return organizationsOverviewAggregation.map(org => ({
      organizationId: org.organizationId.toString(),
      organizationName: org.organizationName || 'Unknown',
      userCount: org.userCount
    }));
  }

  /**
   * Get monthly analytics data for backward compatibility
   */
  private async getMonthlyData(year: string, roleId?: string): Promise<MonthlyUserData[]> {
    const targetYear = parseInt(year);

    const matchConditions: any = {
      deletedAt: null,
      createdAt: {
        $gte: new Date(targetYear, 0, 1),
        $lte: new Date(targetYear, 11, 31, 23, 59, 59),
      }
    };

    if (roleId) {
      matchConditions['organizationDetails.role'] = new mongoose.Types.ObjectId(roleId);
    }

    const monthlyAggregation = await User.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: { $month: '$createdAt' },
          users: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return months.map((month, index) => {
      const monthNumber = index + 1;
      const found = monthlyAggregation.find(item => item._id === monthNumber);

      return {
        month,
        users: found ? found.users : 0
      };
    });
  }

  /**
   * Get date ranges for current and previous month
   */
  private getMonthDateRanges() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11

    // Current month: from 1st of current month to current date (month-to-date)
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(); // today

    // Previous month: full previous month (1st to last day of previous month)
    let previousMonthStart: Date;
    let previousMonthEnd: Date;

    if (currentMonth === 0) { // January
      // Previous month is December of previous year
      previousMonthStart = new Date(currentYear - 1, 11, 1); // Dec 1
      previousMonthEnd = new Date(currentYear - 1, 11, 31, 23, 59, 59); // Dec 31
    } else {
      // Previous month in same year
      previousMonthStart = new Date(currentYear, currentMonth - 1, 1);
      // Get last day of previous month
      previousMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    }

    return {
      currentPeriod: { start: currentMonthStart, end: currentMonthEnd },
      previousPeriod: { start: previousMonthStart, end: previousMonthEnd }
    };
  }

  /**
   * Get user counts for a specific date range
   */
  private async getUserCountsForDateRange(startDate: Date, endDate: Date) {
    const baseConditions = {
      deletedAt: null,
      createdAt: { $gte: startDate, $lte: endDate }
    };

    const totalUsers = await User.countDocuments(baseConditions);
    const activeUsers = await User.countDocuments({
      ...baseConditions,
      active: true
    });
    const inactiveUsers = await User.countDocuments({
      ...baseConditions, 
      active: false
    });

    return { totalUsers, activeUsers, inactiveUsers };
  }

  /**
   * Get group counts for a specific date range
   */
  private async getGroupCountsForDateRange(startDate: Date, endDate: Date) {
    return await Group.countDocuments({
      deletedAt: null,
      createdAt: { $gte: startDate, $lte: endDate }
    });
  }

  /**
   * Get department counts for a specific date range
   */
  private async getDepartmentCountsForDateRange(startDate: Date, endDate: Date) {
    return await Department.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
  }

  /**
   * Calculate percentage change between two values
   */
  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Calculate month-over-month changes
   */
  private async calculateChangeMetrics(): Promise<ChangeMetrics> {
    const { currentPeriod, previousPeriod } = this.getMonthDateRanges();

    // Get current period counts
    const [currentUserCounts, currentGroupCount, currentDeptCount] = await Promise.all([
      this.getUserCountsForDateRange(currentPeriod.start, currentPeriod.end),
      this.getGroupCountsForDateRange(currentPeriod.start, currentPeriod.end),
      this.getDepartmentCountsForDateRange(currentPeriod.start, currentPeriod.end)
    ]);

    // Get previous period counts
    const [previousUserCounts, previousGroupCount, previousDeptCount] = await Promise.all([
      this.getUserCountsForDateRange(previousPeriod.start, previousPeriod.end),
      this.getGroupCountsForDateRange(previousPeriod.start, previousPeriod.end),
      this.getDepartmentCountsForDateRange(previousPeriod.start, previousPeriod.end)
    ]);


    return {
      totalUsersChange: this.calculatePercentageChange(
        currentUserCounts.totalUsers, 
        previousUserCounts.totalUsers
      ),
      activeUsersChange: this.calculatePercentageChange(
        currentUserCounts.activeUsers, 
        previousUserCounts.activeUsers
      ),
      inactiveUsersChange: this.calculatePercentageChange(
        currentUserCounts.inactiveUsers, 
        previousUserCounts.inactiveUsers
      ),
      totalGroupsChange: this.calculatePercentageChange(
        currentGroupCount, 
        previousGroupCount
      ),
      totalDepartmentsChange: this.calculatePercentageChange(
        currentDeptCount, 
        previousDeptCount
      )
    };
  }

  /**
   * Get enhanced user management statistics
   */
  getUserStatistics = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { year, roleId } = req.query;
      const filterYear = year ? parseInt(year as string) : undefined;

      // Get all statistics using extracted methods
      const [userCounts, departmentGroupCounts, recentlyAddedUsers, organizationsOverview, changeMetrics] = await Promise.all([
        this.getUserCounts(),
        this.getDepartmentAndGroupCounts(),
        this.getRecentlyAddedUsers(),
        this.getOrganizationsOverviewData(filterYear),
        this.calculateChangeMetrics()
      ]);

      const { totalUsers, activeUsers, inactiveUsers } = userCounts;
      const { totalDepartments, totalGroups } = departmentGroupCounts;

      // Get role breakdown (needs total users count and optional year filter)
      const roleBreakdown = await this.getRoleBreakdown(totalUsers, filterYear);

      // Generate monthly analytics data if year is provided
      let monthlyData: MonthlyUserData[] = [];
      if (year) {
        monthlyData = await this.getMonthlyData(year as string, roleId as string);
      }

      const statistics: EnhancedUserStatistics = {
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalGroups,
        totalDepartments,
        recentlyAddedUsers,
        roleBreakdown,
        organizationsOverview,
        changeMetrics,
        ...(year && { monthlyData })
      };

      return sendSuccessResp(res, 200, USERS_MGMT_FETCHED, statistics, req);
    } catch (error) {
      throw AppError.internal('Failed to fetch user statistics');
    }
  });

  /**
   * Get roles breakdown analytics
   * GET /user-management/analytics/roles-breakdown
   */
  getRolesBreakdownEndpoint = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { year } = req.query;
      const filterYear = year ? parseInt(year as string) : undefined;

      // Get total users count for percentage calculation
      let totalUsersMatchConditions: any = { deletedAt: null };
      if (filterYear) {
        totalUsersMatchConditions.createdAt = {
          $gte: new Date(filterYear, 0, 1),
          $lte: new Date(filterYear, 11, 31, 23, 59, 59),
        };
      }
      
      const totalUsers = await User.countDocuments(totalUsersMatchConditions);
      const roleBreakdown = await this.getRoleBreakdown(totalUsers, filterYear);

      return sendSuccessResp(res, 200, 'Roles breakdown fetched successfully', {
        roleBreakdown,
        totalUsers,
        ...(filterYear && { year: filterYear })
      }, req);
    } catch (error) {
      throw AppError.internal('Failed to fetch roles breakdown analytics');
    }
  });

  /**
   * Get organizations overview analytics
   * GET /user-management/analytics/organizations-overview
   */
  getOrganizationsOverviewEndpoint = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { year } = req.query;
      const filterYear = year ? parseInt(year as string) : undefined;

      const organizationsOverview = await this.getOrganizationsOverviewData(filterYear);
      
      // Calculate total users across all organizations
      const totalUsers = organizationsOverview.reduce((sum, org) => sum + org.userCount, 0);

      return sendSuccessResp(res, 200, 'Organizations overview fetched successfully', {
        organizationsOverview,
        totalUsers,
        ...(filterYear && { year: filterYear })
      }, req);
    } catch (error) {
      throw AppError.internal('Failed to fetch organizations overview analytics');
    }
  });

  /**
   * Get user analytics with trends data
   * GET /user-management/analytics/user-trends
   */
  getUserTrends = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { year = new Date().getFullYear(), roleId } = req.query;
      const targetYear = parseInt(year as string);

      // Build match conditions
      const matchConditions: any = {
        deletedAt: null,
        createdAt: {
          $gte: new Date(targetYear, 0, 1),
          $lte: new Date(targetYear, 11, 31, 23, 59, 59),
        }
      };

      if (roleId) {
        matchConditions['organizationDetails.role'] = new mongoose.Types.ObjectId(roleId as string);
      }

      // Get monthly user creation trends
      const monthlyAggregation = await User.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: { $month: '$createdAt' },
            users: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      // Create array with all 12 months, filling missing months with 0
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const monthlyData: MonthlyUserData[] = months.map((month, index) => {
        const monthNumber = index + 1;
        const found = monthlyAggregation.find(item => item._id === monthNumber);

        return {
          month,
          users: found ? found.users : 0
        };
      });

      // Get available roles for dropdown
      const availableRoles = await Role.find({}, { _id: 1, name: 1 }).sort({ name: 1 });

      const response: UserTrendsResponse = {
        monthlyData,
        availableRoles: availableRoles.map(role => ({
          id: role._id.toString(),
          name: role.name
        })),
        year: targetYear,
        ...(roleId && { roleId: roleId as string })
      };

      return sendSuccessResp(res, 200, USER_TRENDS_FETCHED, response, req);
    } catch (error) {
      throw AppError.internal('Failed to fetch user trends analytics');
    }
  });

  /**
   * Get users by department analytics
   * GET /user-management/analytics/users-by-department
   */
  getUsersByDepartment = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { departmentId, organizationId, year } = req.query;

      // Build user match conditions
      const userMatchConditions: any = {
        $expr: {
          $and: [
            { $eq: ['$organizationDetails.department', '$$deptId'] },
            { $eq: ['$deletedAt', null] }
          ]
        }
      };

      // Add year filtering if provided
      if (year) {
        const targetYear = parseInt(year as string);
        userMatchConditions.$expr.$and.push({
          $and: [
            { $gte: ['$createdAt', new Date(targetYear, 0, 1)] },
            { $lte: ['$createdAt', new Date(targetYear, 11, 31, 23, 59, 59)] }
          ]
        });
      }

      // Get all departments with user counts
      const departmentUserCounts = await Department.aggregate([
        {
          $match: {
            ...(departmentId && { _id: new mongoose.Types.ObjectId(departmentId as string) }),
            ...(organizationId && { organization: new mongoose.Types.ObjectId(organizationId as string) })
          }
        },
        {
          $lookup: {
            from: 'users',
            let: { deptId: '$_id' },
            pipeline: [
              {
                $match: userMatchConditions
              }
            ],
            as: 'users'
          }
        },
        {
          $lookup: {
            from: 'organizations',
            localField: 'organization',
            foreignField: '_id',
            as: 'organizationDetails'
          }
        },
        {
          $project: {
            departmentId: '$_id',
            departmentName: '$name',
            organizationName: { $arrayElemAt: ['$organizationDetails.organizationName', 0] },
            userCount: { $size: '$users' }
          }
        },
        {
          $sort: { userCount: -1 }
        }
      ]);

      const departments: DepartmentUserCount[] = departmentUserCounts.map(dept => ({
        departmentId: dept.departmentId.toString(),
        departmentName: dept.departmentName,
        organizationName: dept.organizationName || 'Unknown',
        userCount: dept.userCount
      }));

      // Calculate total users across all departments
      const totalUsers = departments.reduce((sum, dept) => sum + dept.userCount, 0);

      const response: UsersByDepartmentResponse = {
        departments,
        totalUsers
      };

      return sendSuccessResp(res, 200, USERS_BY_DEPARTMENT_FETCHED, response, req);
    } catch (error) {
      throw AppError.internal('Failed to fetch users by department analytics');
    }
  });
}

export default StatisticsController;