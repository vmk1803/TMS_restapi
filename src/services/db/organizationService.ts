import { BaseService, PaginationOptions, PaginatedResult } from '../BaseService';
import Organization, { IOrganization } from '../../models/Organization';
import { AppError } from '../../common/errors/AppError';
import { logError } from '../../utils/logger';
import { validateObjectId, validatePaginationParams } from '../../common/utils/validationHelpers';
import { ensureExists } from '../../common/utils/existenceHelpers';
import mongoose from 'mongoose';

export interface CreateOrganizationServiceData {
  organizationName: string;
  email: string;
  contactNumber: string;
  description: string;
  status?: string;
  primaryAdmin: string;
  locations: string[];
  createdBy: string;
  createdAt?: Date;
}

export interface UpdateOrganizationServiceData {
  organizationName?: string;
  email?: string;
  contactNumber?: string;
  description?: string;
  status?: string;
  primaryAdmin?: string;
  locations?: string[];
}

export interface OrganizationServiceQuery {
  page?: number;
  pageSize?: number;
  searchString?: string;
  createdBy?: string;
  status?: string;
}

export interface PaginatedOrganizationsResult {
  pagination_info: {
    total_records: number;
    total_pages: number;
    page_size: number;
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
  };
  records: IOrganization[];
}

class OrganizationService extends BaseService<IOrganization> {
  constructor() {
    super(Organization);
  }

  async createOrganization(data: CreateOrganizationServiceData): Promise<IOrganization> {
    // Validate email uniqueness
    const existingOrg = await this.findOne({ email: data.email, deletedAt: null });
    console.log(existingOrg, existingOrg && existingOrg !== null, "#4444444444444");
    if (existingOrg) {
      throw AppError.badRequest('Organization with this email already exists');
    }

    // Transform data to match IOrganization interface
    const transformedData: any = {
      organizationName: data.organizationName,
      email: data.email,
      contactNumber: data.contactNumber,
      description: data.description,
      status: data.status || 'active',
      locations: data.locations,
      createdBy: new mongoose.Types.ObjectId(data.createdBy)
    };

    // Include primaryAdmin if provided (optional field)
    if (data.primaryAdmin) {
      transformedData.primaryAdmin = new mongoose.Types.ObjectId(data.primaryAdmin);
    }

    // Include createdAt if provided (for frontend server timestamp)
    if (data.createdAt) {
      transformedData.createdAt = new Date(data.createdAt);
    }
    console.log(transformedData, "#33333333333333");

    const createdOrganization = await this.create(transformedData);

    // Return the populated organization data for consistency
    const populatedOrganization = await this.getOrganizationById(createdOrganization._id.toString());
    if (!populatedOrganization) {
      throw AppError.internal('Failed to retrieve created organization');
    }
    return populatedOrganization;
  }

  async getOrganizationById(id: string): Promise<IOrganization | null> {
    validateObjectId(id, 'Organization ID');

    const [organization] = await Organization.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id), deletedAt: null } },
      // Populate locations
      {
        $lookup: {
          from: 'locations',
          localField: 'locations',
          foreignField: '_id',
          as: 'locations'
        }
      },
      // Populate primaryAdmin
      {
        $lookup: {
          from: 'users',
          localField: 'primaryAdmin',
          foreignField: '_id',
          as: 'primaryAdmin'
        }
      },
      { $unwind: { path: '$primaryAdmin', preserveNullAndEmptyArrays: true } },
      // Populate primaryAdmin's role and department
      {
        $lookup: {
          from: 'roles',
          localField: 'primaryAdmin.organizationDetails.role',
          foreignField: '_id',
          as: 'primaryAdminRole',
          pipeline: [{ $project: { name: 1 } }]
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'primaryAdmin.organizationDetails.department',
          foreignField: '_id',
          as: 'primaryAdminDepartment',
          pipeline: [{ $project: { name: 1 } }]
        }
      },
      // Populate createdBy
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy',
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }]
        }
      },
      { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
      // Populate departments for this organization
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: 'organization',
          as: 'departments',
          pipeline: [
            { $match: { deletedAt: { $exists: true, $eq: null } } },
            { $project: { name: 1 } }
          ]
        }
      },
      // Add computed fields
      {
        $addFields: {
          'primaryAdmin.role': { $arrayElemAt: ['$primaryAdminRole.name', 0] },
          'primaryAdmin.department': { $arrayElemAt: ['$primaryAdminDepartment.name', 0] }
        }
      },
      // Clean up temporary fields
      {
        $project: {
          primaryAdminRole: 0,
          primaryAdminDepartment: 0
        }
      }
    ]);

    if (organization) {
      this.postProcessOrganization(organization);
    }
    return organization;
  }

  async getOrganizationsPaginated(query: OrganizationServiceQuery): Promise<PaginatedOrganizationsResult> {
    const validatedQuery = this.validatePaginationQuery(query);
    const processedQuery = this.processSearchQuery(validatedQuery);

    // Build match conditions
    const matchConditions: any = { deletedAt: null };
    if (processedQuery.createdBy) {
      matchConditions.createdBy = new mongoose.Types.ObjectId(processedQuery.createdBy);
    }
    if (processedQuery.status) {
      matchConditions.status = processedQuery.status;
    }
    if (processedQuery.searchString) {
      matchConditions.$or = [
        { organizationName: { $regex: processedQuery.searchString, $options: 'i' } },
        { description: { $regex: processedQuery.searchString, $options: 'i' } }
      ];
    }

    // Single aggregation pipeline with facet for count and data
    const pipeline: mongoose.PipelineStage[] = [
      { $match: matchConditions },
      
      // Lookup departments count
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: 'organization',
          as: 'departments',
          pipeline: [{ $match: { deletedAt: { $exists: true, $eq: null } } }]
        }
      },
      
      // Lookup users count  
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'organizationDetails.organization',
          as: 'users',
          pipeline: [{ $match: { deletedAt: { $exists: true, $eq: null } } }]
        }
      },
      
      // Add computed fields
      {
        $addFields: {
          departmentCount: { $size: '$departments' },
          userCount: { $size: '$users' }
        }
      },
      
      // Remove lookup arrays
      { $project: { departments: 0, users: 0 } },
      
      // Sort
      { $sort: { createdAt: -1 } },
      
      // Use facet to get both count and paginated data in single query
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          paginatedResults: [
            { $skip: (processedQuery.page! - 1) * processedQuery.pageSize! },
            { $limit: processedQuery.pageSize! }
          ]
        }
      }
    ];

    const [result] = await Organization.aggregate(pipeline);
    const totalRecords = result.totalCount[0]?.count || 0;
    const organizations = result.paginatedResults;

    // Post-process results
    const processedRecords = organizations.map((organization: IOrganization) => {
      this.postProcessOrganization(organization);
      return organization;
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalRecords / processedQuery.pageSize!);
    const currentPage = processedQuery.page!;

    return {
      pagination_info: {
        total_records: totalRecords,
        total_pages: totalPages,
        page_size: processedQuery.pageSize!,
        current_page: currentPage,
        next_page: currentPage < totalPages ? currentPage + 1 : null,
        prev_page: currentPage > 1 ? currentPage - 1 : null,
      },
      records: processedRecords
    };
  }

  async updateOrganization(id: string, data: UpdateOrganizationServiceData): Promise<IOrganization | null> {
    validateObjectId(id, 'Organization ID');

    // Check if email is being updated and if it's unique
    if (data.email) {
      const existingOrg = await this.findOne({
        email: data.email,
        deletedAt: null,
        _id: { $ne: id }
      });
      if (existingOrg) {
        throw AppError.badRequest('Organization with this email already exists');
      }
    }

    // Check if organization exists
    const existingOrganization = await this.findById(id);
    ensureExists(existingOrganization, 'Organization', id);

    // Transform data to handle populated locations and convert to ObjectIds
    const transformedData: any = { ...data };

    // Convert locations back to ObjectIds if they are full objects
    if (data.locations) {
      transformedData.locations = data.locations.map((loc: any) => {
        if (typeof loc === 'string') {
          return new mongoose.Types.ObjectId(loc);
        }
        // If it's an object, extract the _id
        return loc._id || loc.id;
      });
    }

    // Convert primaryAdmin to ObjectId if it's a string
    if (data.primaryAdmin && typeof data.primaryAdmin === 'string') {
      transformedData.primaryAdmin = new mongoose.Types.ObjectId(data.primaryAdmin);
    }

    // Update the organization
    const updatedOrganization = await this.updateById(id, transformedData);

    if (!updatedOrganization) {
      return null;
    }

    // Return the populated organization data
    return await this.getOrganizationById(id);
  }

  async deleteOrganization(id: string): Promise<boolean> {
    validateObjectId(id, 'Organization ID');

    // Check if organization exists
    const existingOrganization = await this.findById(id);
    ensureExists(existingOrganization, 'Organization', id);

    // Additional business logic can be added here (e.g., check dependencies)

    return await this.softDeleteById(id);
  }

  async getOrganizationsByUserId(userId: string): Promise<IOrganization[]> {
    const organizations = await this.findAll(
      { createdBy: userId, deletedAt: null }
    );

    return organizations.map(organization => {
      this.postProcessOrganization(organization);
      return organization;
    });
  }

  async getAllOrganizations(): Promise<IOrganization[]> {
    const organizations = await this.findAll(
      { deletedAt: null }
    );

    return organizations.map(organization => {
      this.postProcessOrganization(organization);
      return organization;
    });
  }

  /**
   * Export all organizations as CSV with filters applied (no pagination)
   */
  async exportOrganizationsAsCSV(query: Omit<OrganizationServiceQuery, 'page' | 'pageSize'>): Promise<any[]> {
    try {
      const processedQuery = this.processSearchQuery(query);
      
      // Build filter for all organizations without pagination
      const filter: any = { deletedAt: null };
      if (processedQuery.createdBy) {
        filter.createdBy = processedQuery.createdBy;
      }
      if (processedQuery.searchString) {
        filter.$or = [
          { organizationName: { $regex: processedQuery.searchString, $options: 'i' } },
          { email: { $regex: processedQuery.searchString, $options: 'i' } },
          { description: { $regex: processedQuery.searchString, $options: 'i' } }
        ];
      }

      const organizations = await this.findAll(filter, { createdAt: -1 });
      
      // Transform data to return only required fields for CSV export
      return organizations.map(organization => ({
        Organization: organization.organizationName,
        Locations: Array.isArray(organization.locations) ? organization.locations.length : 0,
        Contact: organization.contactNumber,
        Email: organization.email,
        Status: 'Active' // Assuming all non-deleted organizations are active
      }));
    } catch (error) {
      throw AppError.internal('Failed to export organizations');
    }
  }

  /**
   * Bulk update organization status
   */
  async bulkUpdateStatus(organizationIds: string[], status: string): Promise<{ modifiedCount: number }> {
    // Validate all IDs are valid ObjectIds
    organizationIds.forEach(id => validateObjectId(id, 'Organization ID'));

    // Validate status
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      throw AppError.badRequest('Invalid status. Must be: active, inactive, or suspended');
    }

    try {
      const result = await Organization.updateMany(
        { 
          _id: { $in: organizationIds.map(id => new mongoose.Types.ObjectId(id)) },
          deletedAt: null // Only update non-deleted organizations
        },
        { 
          $set: { 
            status: status,
            updatedAt: new Date()
          } 
        }
      );

      return { modifiedCount: result.modifiedCount };
    } catch (error) {
      logError(error as Error, {}, 'Bulk update organization status failed');
      throw AppError.internal('Failed to update organization statuses');
    }
  }

  // Private helper methods for business logic

  private validatePaginationQuery(query: OrganizationServiceQuery): OrganizationServiceQuery {
    const { page = 1, pageSize = 10 } = query;
    validatePaginationParams(page, pageSize);
    return { ...query, page, pageSize };
  }

  private processSearchQuery(query: OrganizationServiceQuery): OrganizationServiceQuery {
    const { searchString } = query;

    if (searchString && searchString.length < 2) {
      throw AppError.badRequest('Search string must be at least 2 characters long');
    }

    return query;
  }

  private postProcessOrganization(organization: IOrganization): void {
    // Add computed fields, format data, etc.
    (organization as any).id = organization._id.toString();
  }
}

export default OrganizationService;
