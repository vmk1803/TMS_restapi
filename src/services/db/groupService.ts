import { BaseService, PaginationOptions, PaginatedResult } from '../BaseService';
import Group, { IGroup } from '../../models/Group';
import GroupActivityService from './groupActivityService';
import { ValidatedUpdateGroup } from '../../validations/schema/vGroupSchema';
import { AppError } from '../../common/errors/AppError';
import { logError } from '../../utils/logger';
import { validateObjectId, validatePaginationParams } from '../../common/utils/validationHelpers';
import { ensureExists } from '../../common/utils/existenceHelpers';

export interface CreateGroupServiceData {
  name: string;
  department: string;
  manager: string;
  members: string[];
  description?: string;
  createdBy: string;
}

export interface UpdateGroupServiceData {
  name?: string;
  department?: string;
  manager?: string;
  members?: string[];
  description?: string;
}

export interface GroupServiceQuery {
  page?: number;
  pageSize?: number;
  search_string?: string;
  department?: string;
  status?: string;
}

export interface GroupMembersQuery extends GroupServiceQuery {
  // Inherits all properties from GroupServiceQuery
}

export interface PaginatedGroupsResult {
  pagination_info: {
    total_records: number;
    total_pages: number;
    page_size: number;
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
  };
  records: IGroup[];
}

class GroupService extends BaseService<IGroup> {
  private readonly activityService: GroupActivityService;

  constructor() {
    super(Group);
    this.activityService = new GroupActivityService();
  }

  async createGroup(data: CreateGroupServiceData): Promise<IGroup> {
    if (!data.name || !data.department || !data.manager || !data.members || data.members.length === 0) {
      throw AppError.badRequest('Group data is incomplete');
    }

    const groupData = {
      name: data.name,
      department: data.department,
      manager: data.manager,
      members: data.members,
      description: data.description,
      createdBy: data.createdBy
    };

    const createdGroup = await this.create(groupData as unknown as Partial<IGroup>);

    // Log activity
    try {
      await this.activityService.logActivity({
        groupId: createdGroup._id.toString(),
        action: 'CREATE',
        performedBy: data.createdBy,
        newData: data,
        ipAddress: (global as any).request?.ip,
        userAgent: (global as any).request?.get?.('User-Agent')
      });
    } catch (activityError) {
      // Log activity error but don't fail the main operation
      logError(activityError as Error, { groupId: createdGroup._id }, 'groupService.ts');
    }

    return createdGroup;
  }

  async getGroupById(id: string): Promise<IGroup | null> {
    validateObjectId(id, 'Group ID');

    const group = await this.findById(id, ['department', 'manager', 'members']);
    return group;
  }

  async getGroupsPaginated(query: GroupServiceQuery): Promise<PaginatedGroupsResult> {
    const validatedQuery = this.validatePaginationQuery(query);
    const processedQuery = this.processSearchQuery(validatedQuery);

    // Build filter for BaseService
    const filter: any = { deletedAt: null };
    if (processedQuery.search_string) {
      filter.name = { $regex: processedQuery.search_string, $options: 'i' };
    }
    if (processedQuery.department) {
      filter.department = processedQuery.department;
    }

    const result = await this.findWithPagination(
      filter,
      { page: processedQuery.page, pageSize: processedQuery.pageSize },
      { createdAt: -1 },
      ['department', 'manager', 'members']
    );

    return {
      pagination_info: result.pagination,
      records: result.data
    };
  }

  async updateGroup(id: string, data: UpdateGroupServiceData): Promise<IGroup | null> {
    validateObjectId(id, 'Group ID');

    // Check if group exists
    const existingGroup = await this.findById(id);
    ensureExists(existingGroup, 'Group', id);

    const updateData: any = { updatedAt: new Date() };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.manager !== undefined) updateData.manager = data.manager;
    if (data.members !== undefined) updateData.members = data.members;
    if (data.description !== undefined) updateData.description = data.description;

    const updatedGroup = await this.updateById(id, updateData, undefined, ['department', 'manager', 'members']);

    return updatedGroup;
  }

  async deleteGroup(id: string): Promise<boolean> {
    validateObjectId(id, 'Group ID');

    // Check if group exists
    const existingGroup = await this.findById(id);
    ensureExists(existingGroup, 'Group', id);

    // Check dependencies (additional business rules can be added here)

    return await this.softDeleteById(id);
  }

  async getAllGroups(): Promise<IGroup[]> {
    const groups = await this.findAll(
      { deletedAt: null },
      undefined,
      ['department', 'manager', 'members']
    );

    return groups;
  }

  async getGroupMembers(groupId: string, query: GroupMembersQuery): Promise<PaginatedGroupsResult> {
    validateObjectId(groupId, 'Group ID');

    const validatedQuery = this.validatePaginationQuery(query);
    const processedQuery = this.processGroupMembersQuery(validatedQuery);

    // MongoDB aggregation pipeline to get group members with filters
    const pipeline: any[] = [
      // Match the specific group
      { $match: { _id: this.toObjectId(groupId), deletedAt: null } },

      // Unwind the members array to get individual member IDs
      { $unwind: '$members' },

      // Lookup user details
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'memberDetails'
        }
      },

      // Unwind the member details (should be one per member)
      { $unwind: '$memberDetails' },

      // Filter out deleted users
      { $match: { 'memberDetails.deletedAt': null } },

      // Apply search filter if provided
      ...(processedQuery.search_string ? [{
        $match: {
          $or: [
            { 'memberDetails.firstName': { $regex: processedQuery.search_string, $options: 'i' } },
            { 'memberDetails.lastName': { $regex: processedQuery.search_string, $options: 'i' } },
            { 'memberDetails.email': { $regex: processedQuery.search_string, $options: 'i' } }
          ]
        }
      }] : []),

      // Apply department filter if provided
      ...(processedQuery.department ? [{
        $match: { 'memberDetails.organizationDetails.department': this.toObjectId(processedQuery.department) }
      }] : []),

      // Apply status filter if provided
      ...(processedQuery.status ? [{
        $match: { 'memberDetails.active': processedQuery.status === 'true' }
      }] : []),

      // Lookup additional populated data
      {
        $lookup: {
          from: 'roles',
          localField: 'memberDetails.organizationDetails.role',
          foreignField: '_id',
          as: 'memberDetails.role'
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'memberDetails.organizationDetails.department',
          foreignField: '_id',
          as: 'memberDetails.department'
        }
      },
      {
        $lookup: {
          from: 'organizations',
          localField: 'memberDetails.organizationDetails.organization',
          foreignField: '_id',
          as: 'memberDetails.organization'
        }
      },

      // Unwind the populated arrays (they should have one element each)
      {
        $addFields: {
          'memberDetails.role': { $arrayElemAt: ['$memberDetails.role', 0] },
          'memberDetails.department': { $arrayElemAt: ['$memberDetails.department', 0] },
          'memberDetails.organization': { $arrayElemAt: ['$memberDetails.organization', 0] }
        }
      },

      // Group back to get the final member list
      {
        $group: {
          _id: null,
          members: { $push: '$memberDetails' },
          totalCount: { $sum: 1 }
        }
      }
    ];

    const result = await this.model.aggregate(pipeline);

    if (!result || result.length === 0) {
      return {
        pagination_info: {
          total_records: 0,
          total_pages: 0,
          page_size: processedQuery.pageSize,
          current_page: processedQuery.page,
          next_page: null,
          prev_page: null
        },
        records: []
      };
    }

    const { members, totalCount } = result[0];

    // Apply pagination to the results
    const totalPages = Math.ceil(totalCount / processedQuery.pageSize);
    const startIndex = (processedQuery.page - 1) * processedQuery.pageSize;
    const endIndex = startIndex + processedQuery.pageSize;
    const paginatedMembers = members.slice(startIndex, endIndex);

    return {
      pagination_info: {
        total_records: totalCount,
        total_pages: totalPages,
        page_size: processedQuery.pageSize,
        current_page: processedQuery.page,
        next_page: processedQuery.page < totalPages ? processedQuery.page + 1 : null,
        prev_page: processedQuery.page > 1 ? processedQuery.page - 1 : null
      },
      records: paginatedMembers
    };
  }

  private validatePaginationQuery(query: GroupServiceQuery): GroupServiceQuery {
    const { page = 1, pageSize = 10 } = query;
    validatePaginationParams(page, pageSize);
    return { ...query, page, pageSize };
  }

  private processSearchQuery(query: GroupServiceQuery): GroupServiceQuery {
    const { search_string } = query;

    if (search_string && search_string.length < 2) {
      throw AppError.badRequest('Search string must be at least 2 characters long');
    }

    return query;
  }

  private processGroupMembersQuery(query: GroupMembersQuery): GroupMembersQuery {
    const { search_string } = query;

    if (search_string && search_string.length < 2) {
      throw AppError.badRequest('Search string must be at least 2 characters long');
    }

    return query;
  }

  private toObjectId(id: string) {
    return new this.model.base.Types.ObjectId(id);
  }
}

export default GroupService;
