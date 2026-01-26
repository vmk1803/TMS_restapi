import { BaseService, PaginationOptions, PaginatedResult } from '../BaseService';
import Role, { IRole } from '../../models/Role';
import { AppError } from '../../common/errors/AppError';
import { validateObjectId } from '../../common/utils/validationHelpers';

export interface CreateRoleServiceData {
  name: string;
  description?: string;
  permissions: {
    projects: string[];
    task: string[];
    users: string[];
    settings: string[];
  };
  createdBy?: string;
}

export interface UpdateRoleServiceData {
  name?: string;
  description?: string;
  permissions?: {
    projects?: string[];
    task?: string[];
    users?: string[];
    settings?: string[];
  };
}

export interface RoleServiceQuery {
  page?: number;
  pageSize?: number;
  searchString?: string;
  permissionSection?: string;
}

export interface PaginatedRolesResult {
  pagination_info: {
    total_records: number;
    total_pages: number;
    page_size: number;
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
  };
  records: IRole[];
}

class RoleService extends BaseService<IRole> {
  constructor() {
    super(Role);
  }

  async createRole(data: CreateRoleServiceData): Promise<IRole> {
    // Validate required fields
    if (!data.name || !data.permissions) {
      throw AppError.badRequest("Name and permissions are required");
    }

    // Check for duplicate role name
    const existingRole = await this.findOne({
      name: { $regex: `^${this.escapeRegex(data.name)}$`, $options: 'i' }
    });
    if (existingRole) {
      throw AppError.badRequest('Role with this name already exists');
    }

    // Transform data to match IRole interface
    const transformedData: any = {
      name: data.name,
      permissions: data.permissions
    };

    if (data.description) {
      transformedData.description = data.description;
    }

    if (data.createdBy) {
      validateObjectId(data.createdBy, 'Created By ID');
      transformedData.createdBy = data.createdBy;
    }

    const createdRole = await this.create(transformedData);
    return createdRole;
  }

  async updateRole(id: string, data: UpdateRoleServiceData): Promise<IRole | null> {
    validateObjectId(id, 'Role ID');

    // Check if role exists
    const existingRole = await this.findById(id);
    if (!existingRole) {
      throw AppError.notFound('Role not found');
    }

    // Check for duplicate role name (if name is being updated)
    if (data.name) {
      const duplicateRole = await this.findOne({
        name: { $regex: `^${this.escapeRegex(data.name)}$`, $options: 'i' },
        _id: { $ne: id }
      });
      if (duplicateRole) {
        throw AppError.badRequest('Role with this name already exists');
      }
    }

    // Transform update data
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.permissions !== undefined) updateData.permissions = data.permissions;

    const updatedRole = await this.updateById(id, updateData);
    return updatedRole;
  }

  async getRoleById(id: string): Promise<IRole | null> {
    validateObjectId(id, 'Role ID');

    const role = await Role.findById(id)
      .populate({
        path: 'createdBy',
        select: 'firstName lastName'
      })
      .exec();

    return role as any;
  }

  async getRolesPaginated(query: RoleServiceQuery): Promise<PaginatedRolesResult> {
    const validatedQuery = this.validatePaginationQuery(query);
    const processedQuery = this.processSearchQuery(validatedQuery);

    // Build filter for aggregation
    const matchFilter: any = {};

    // Search filter - partial match in role name
    if (processedQuery.searchString) {
      matchFilter.name = { $regex: this.escapeRegex(processedQuery.searchString), $options: 'i' };
    }

    // Permission section filter - only show roles that have permissions in the specified section
    if (processedQuery.permissionSection && processedQuery.permissionSection !== 'all') {
      // Validate that the permission section is valid
      const validSections = ['projects', 'task', 'users', 'settings'];
      if (!validSections.includes(processedQuery.permissionSection)) {
        throw AppError.badRequest('Invalid permission section');
      }

      // Filter roles that have at least one permission in the specified section
      const fieldPath = `permissions.${processedQuery.permissionSection}`;
      matchFilter[fieldPath] = { $exists: true, $not: { $size: 0 } };
    }

    // Calculate pagination
    const page = processedQuery.page!;
    const pageSize = processedQuery.pageSize!;
    const skip = (page - 1) * pageSize;

    // Aggregation pipeline
    const aggregationPipeline: any[] = [
      // Match roles based on filters
      { $match: matchFilter },

      // Lookup users who have this role assigned
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'organizationDetails.role',
          as: 'assignedUsers'
        }
      },

      // Filter to only count active, non-deleted users and add count
      {
        $addFields: {
          userCount: {
            $size: {
              $filter: {
                input: '$assignedUsers',
                as: 'user',
                cond: {
                  $and: [
                    { $eq: ['$$user.active', true] },
                    { $eq: ['$$user.deletedAt', null] }
                  ]
                }
              }
            }
          }
        }
      },

      // Remove the users array from response (we only need the count)
      {
        $project: {
          assignedUsers: 0
        }
      },

      // Sort by creation date
      { $sort: { createdAt: -1 } },

      // Pagination
      { $skip: skip },
      { $limit: pageSize }
    ];

    // Execute aggregation for data
    const data = await this.model.aggregate(aggregationPipeline);
    console.log("🚀 ~ RoleService ~ getRolesPaginated ~ data:", data)

    // Get total count for pagination
    const totalCountResult = await this.model.aggregate([
      { $match: matchFilter },
      { $count: 'total' }
    ]);

    const totalRecords = totalCountResult.length > 0 ? totalCountResult[0].total : 0;
    const totalPages = Math.ceil(totalRecords / pageSize);

    return {
      pagination_info: {
        total_records: totalRecords,
        total_pages: totalPages,
        page_size: pageSize,
        current_page: page,
        next_page: page < totalPages ? page + 1 : null,
        prev_page: page > 1 ? page - 1 : null
      },
      records: data
    };
  }

  // Private helper methods for business logic

  private validatePaginationQuery(query: RoleServiceQuery): RoleServiceQuery {
    const { page = 1, pageSize = 10 } = query;

    if (page < 1 || pageSize < 1 || pageSize > 100) {
      throw AppError.badRequest('Invalid pagination parameters');
    }

    return { ...query, page, pageSize };
  }

  private processSearchQuery(query: RoleServiceQuery): RoleServiceQuery {
    const { searchString } = query;

    if (searchString && searchString.length < 2) {
      throw AppError.badRequest('Search string must be at least 2 characters long');
    }

    return query;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async getAllRoles(): Promise<IRole[]> {
    const roles = await this.findAll(
      {},
      { createdAt: -1 },
      'createdBy'
    );
    return roles;
  }

  /**
   * Export all roles as CSV with filters applied (no pagination)
   */
  async exportRolesAsCSV(query: Omit<RoleServiceQuery, 'page' | 'pageSize'>): Promise<any[]> {
    try {
      const processedQuery = this.processSearchQuery(query);
      
      // Build filter similar to getRolesPaginated but without pagination
      const matchFilter: any = {};

      if (processedQuery.searchString) {
        matchFilter.name = { $regex: this.escapeRegex(processedQuery.searchString), $options: 'i' };
      }

      if (processedQuery.permissionSection && processedQuery.permissionSection !== 'all') {
        const validSections = ['projects', 'task', 'users', 'settings'];
        if (!validSections.includes(processedQuery.permissionSection)) {
          throw AppError.badRequest('Invalid permission section');
        }
        const fieldPath = `permissions.${processedQuery.permissionSection}`;
        matchFilter[fieldPath] = { $exists: true, $not: { $size: 0 } };
      }

      // Aggregation pipeline without pagination
      const aggregationPipeline: any[] = [
        { $match: matchFilter },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'organizationDetails.role',
            as: 'assignedUsers'
          }
        },
        {
          $addFields: {
            userCount: {
              $size: {
                $filter: {
                  input: '$assignedUsers',
                  as: 'user',
                  cond: {
                    $and: [
                      { $eq: ['$$user.active', true] },
                      { $eq: ['$$user.deletedAt', null] }
                    ]
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            assignedUsers: 0
          }
        },
        { $sort: { createdAt: -1 } }
      ];

      const roles = await this.model.aggregate(aggregationPipeline);
      
      // Transform data to return only required fields for CSV export
      return roles.map(role => {
        // Format permissions as "SectionName: items separated by commas" with each section on new line
        const permissionsFormatted = [];
        if (role.permissions) {
          for (const [key, value] of Object.entries(role.permissions)) {
            if (Array.isArray(value) && value.length > 0) {
              // Capitalize first letter of section name
              const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
              permissionsFormatted.push(`${capitalizedKey}: ${value.join(', ')}`);
            }
          }
        }
        
        return {
          'Role Name': role.name || 'N/A',
          'Permissions': permissionsFormatted.length > 0 ? permissionsFormatted.join(' | ') : 'N/A',
          'Assigned Users': role.userCount || 0
        };
      });
    } catch (error) {
      throw AppError.internal('Failed to export roles');
    }
  }
}

export default RoleService;
