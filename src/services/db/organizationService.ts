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
  primaryAdmin?: string;
  locations?: string[];
}

export interface OrganizationServiceQuery {
  page?: number;
  pageSize?: number;
  searchString?: string;
  createdBy?: string;
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

    // Post-process the created organization
    this.postProcessOrganization(createdOrganization);
    return createdOrganization;
  }

  async getOrganizationById(id: string): Promise<IOrganization | null> {
    validateObjectId(id, 'Organization ID');

    const organization = await this.findById(id, 'locations');
    if (organization) {
      this.postProcessOrganization(organization);
    }
    return organization;
  }

  async getOrganizationsPaginated(query: OrganizationServiceQuery): Promise<PaginatedOrganizationsResult> {
    const validatedQuery = this.validatePaginationQuery(query);
    const processedQuery = this.processSearchQuery(validatedQuery);

    // Build filter for BaseService
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

    const result = await this.findWithPagination(
      filter,
      { page: processedQuery.page, pageSize: processedQuery.pageSize },
      { createdAt: -1 }
    );

    // Post-process results
    result.data = result.data.map((organization: IOrganization) => {
      this.postProcessOrganization(organization);
      return organization;
    });

    return {
      pagination_info: result.pagination,
      records: result.data
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

    const updatedOrganization = await this.updateById(id, transformedData);

    if (updatedOrganization) {
      this.postProcessOrganization(updatedOrganization);
    }
    return updatedOrganization;
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
