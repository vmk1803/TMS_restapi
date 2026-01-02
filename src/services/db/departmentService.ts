import { BaseService, PaginationOptions, PaginatedResult } from '../BaseService';
import Department, { IDepartment } from '../../models/Department';
import Organization from '../../models/Organization';
import { AppError } from '../../common/errors/AppError';
import { validateObjectId } from '../../common/utils/validationHelpers';
import User from '../../models/User';
import mongoose from 'mongoose';

export interface CreateDepartmentServiceData {
  name: string;
  organization: string;
  headOfDepartment?: string;
  status?: string;
}

export interface UpdateDepartmentServiceData {
  name?: string;
  organization?: string;
  headOfDepartment?: string;
  status?: string;
}

export interface DepartmentServiceQuery {
  page?: number;
  pageSize?: number;
  searchString?: string;
  organizationId?: string;
  departmentId?: string;
}

export interface PaginatedDepartmentsResult {
  pagination_info: {
    total_records: number;
    total_pages: number;
    page_size: number;
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
  };
  records: IDepartment[];
}

class DepartmentService extends BaseService<IDepartment> {
  constructor() {
    super(Department);
  }

  async createDepartment(data: CreateDepartmentServiceData): Promise<IDepartment> {
    // Validate organization exists
    validateObjectId(data.organization, 'Organization ID');
    const organization = await Organization.findById(data.organization);
    if (!organization) {
      throw AppError.notFound('Organization not found');
    }

    // Validate head of department (user) exists if provided - for now, just validate ObjectId format
    // In a full implementation, you'd check if the user exists in your user collection
    if (data.headOfDepartment) {
      validateObjectId(data.headOfDepartment, 'Head of Department ID');
    }

    // Check for duplicate department name within the same organization
    const existingDepartment = await this.findOne({
      name: { $regex: `^${data.name}$`, $options: 'i' },
      organization: data.organization
    });
    if (existingDepartment) {
      throw AppError.badRequest('Department with this name already exists in the organization');
    }

    // Transform data to match IDepartment interface
    const transformedData: any = {
      name: data.name,
      organization: new mongoose.Types.ObjectId(data.organization),
      status: data.status || 'active'
    };

    if (data.headOfDepartment) {
      transformedData.headOfDepartment = new mongoose.Types.ObjectId(data.headOfDepartment);
    }

    const createdDepartment = await this.create(transformedData);
    return createdDepartment;
  }

  async updateDepartment(id: string, data: UpdateDepartmentServiceData): Promise<IDepartment | null> {
    validateObjectId(id, 'Department ID');

    // Check if department exists
    const existingDepartment = await this.findById(id);
    if (!existingDepartment) {
      throw AppError.notFound('Department not found');
    }

    // Validate organization exists if being updated
    if (data.organization) {
      validateObjectId(data.organization, 'Organization ID');
      const organization = await Organization.findById(data.organization);
      if (!organization) {
        throw AppError.notFound('Organization not found');
      }
    }

    // Validate head of department exists if being updated and not empty
    if (data.headOfDepartment && data.headOfDepartment.trim()) {
      validateObjectId(data.headOfDepartment, 'Head of Department ID');
    }

    // Check for duplicate department name within the same organization (if name or organization is being updated)
    if (data.name || data.organization) {
      const checkOrg = data.organization || existingDepartment.organization.toString();
      const checkName = data.name || existingDepartment.name;

      const duplicateDepartment = await this.findOne({
        name: { $regex: `^${checkName}$`, $options: 'i' },
        organization: checkOrg,
        _id: { $ne: id } // Exclude current department
      });
      if (duplicateDepartment) {
        throw AppError.badRequest('Department with this name already exists in the organization');
      }
    }

    // Transform update data
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.organization !== undefined) updateData.organization = new mongoose.Types.ObjectId(data.organization);
    if (data.headOfDepartment !== undefined) {
      // Only set headOfDepartment if it's a non-empty string, otherwise set to null to clear it
      updateData.headOfDepartment = data.headOfDepartment && data.headOfDepartment.trim()
        ? new mongoose.Types.ObjectId(data.headOfDepartment)
        : null;
    }

    const updatedDepartment = await this.updateById(id, updateData);
    return updatedDepartment;
  }

  async getDepartmentById(id: string): Promise<IDepartment | null> {
    validateObjectId(id, 'Department ID');

    const department = await this.findById(id, 'organization headOfDepartment');
    return department;
  }

  async getDepartmentsPaginated(query: DepartmentServiceQuery): Promise<PaginatedDepartmentsResult> {
    const validatedQuery = this.validatePaginationQuery(query);
    const processedQuery = this.processSearchQuery(validatedQuery);

    // Build filter for BaseService
    const filter: any = {};

    // Organization filter - always applies if provided
    if (processedQuery.organizationId) {
      filter.organization = processedQuery.organizationId;
    }

    // Department ID filter - exact match by _id
    if (processedQuery.departmentId) {
      validateObjectId(processedQuery.departmentId, 'Department ID');
      filter._id = processedQuery.departmentId;
    }

    // Search filter - partial match in department name
    if (processedQuery.searchString) {
      filter.name = { $regex: processedQuery.searchString, $options: 'i' };
    }

    const result = await this.findWithPagination(
      filter,
      { page: processedQuery.page, pageSize: processedQuery.pageSize },
      { createdAt: -1 },
      'organization headOfDepartment'
    );

    return {
      pagination_info: result.pagination,
      records: result.data
    };
  }

  async getDepartmentsByOrganizationId(organizationId: string, query: DepartmentServiceQuery = {}): Promise<PaginatedDepartmentsResult> {
    validateObjectId(organizationId, 'Organization ID');

    const validatedQuery = this.validatePaginationQuery(query);
    const processedQuery = this.processSearchQuery(validatedQuery);

    // Build filter for BaseService
    const filter: any = { organization: organizationId };
    if (processedQuery.searchString) {
      filter.name = { $regex: processedQuery.searchString, $options: 'i' };
    }

    const result = await this.findWithPagination(
      filter,
      { page: processedQuery.page, pageSize: processedQuery.pageSize },
      { createdAt: -1 },
      'organization headOfDepartment'
    );

    return {
      pagination_info: result.pagination,
      records: result.data
    };
  }

  // Private helper methods for business logic

  private validatePaginationQuery(query: DepartmentServiceQuery): DepartmentServiceQuery {
    const { page = 1, pageSize = 10 } = query;

    if (page < 1 || pageSize < 1 || pageSize > 100) {
      throw AppError.badRequest('Invalid pagination parameters');
    }

    return { ...query, page, pageSize };
  }

  private processSearchQuery(query: DepartmentServiceQuery): DepartmentServiceQuery {
    const { searchString } = query;

    if (searchString && searchString.length < 2) {
      throw AppError.badRequest('Search string must be at least 2 characters long');
    }

    return query;
  }

  async getAllDepartments(): Promise<IDepartment[]> {
    const departments = await this.findAll(
      {},
      { createdAt: -1 },
      'organization headOfDepartment'
    );
    return departments;
  }
}

export default DepartmentService;
