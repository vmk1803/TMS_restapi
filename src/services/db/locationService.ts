import { BaseService, PaginationOptions, PaginatedResult } from '../BaseService';
import Location, { ILocation } from '../../models/Location';
import LocationActivityService from './locationActivityService';
import { ValidatedUpdateLocation } from '../../validations/schema/vLocationSchema';
import { AppError } from '../../common/errors/AppError';
import { logError } from '../../utils/logger';
import { validateObjectId, validatePaginationParams, validateUserId } from '../../common/utils/validationHelpers';
import { ensureExists } from '../../common/utils/existenceHelpers';

export interface CreateLocationServiceData {
  address: any; // Single address object
  createdBy: string;
}

export interface UpdateLocationServiceData {
  addresses?: ValidatedUpdateLocation['addresses'];
}

export interface LocationServiceQuery {
  page?: number;
  pageSize?: number;
  searchString?: string;
  createdBy?: string; // Optional, for public access
}

export interface PaginatedLocationsResult {
  pagination_info: {
    total_records: number;
    total_pages: number;
    page_size: number;
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
  };
  records: ILocation[];
}

class LocationService extends BaseService<ILocation> {
  private readonly activityService: LocationActivityService;

  constructor() {
    super(Location);
    this.activityService = new LocationActivityService();
  }

  async createLocation(data: CreateLocationServiceData): Promise<ILocation> {
    if (!data.address) {
      throw AppError.badRequest('Address is required');
    }

    const transformedData = this.transformLocationData(data);
    this.validateAddress(transformedData);

    const createdLocation = await this.create(transformedData);

    // Log activity
    try {
      await this.activityService.logActivity({
        locationId: createdLocation._id.toString(),
        action: 'CREATE',
        performedBy: data.createdBy,
        newData: transformedData,
        ipAddress: (global as any).request?.ip,
        userAgent: (global as any).request?.get?.('User-Agent')
      });
    } catch (activityError) {
      // Log activity error but don't fail the main operation
      logError(activityError as Error, { locationId: createdLocation._id, action: 'CREATE' }, 'locationService.ts');
    }

    return createdLocation;
  }

  async getLocationById(id: string): Promise<ILocation | null> {
    validateObjectId(id, 'Location ID');

    const location = await this.findById(id, 'createdBy');
    return location;
  }

  async getLocationsPaginated(query: LocationServiceQuery): Promise<PaginatedLocationsResult> {
    const validatedQuery = this.validatePaginationQuery(query);
    const processedQuery = this.processSearchQuery(validatedQuery);

    // Build filter for BaseService
    const filter: any = { deletedAt: null };
    if (processedQuery.createdBy) {
      filter.createdBy = processedQuery.createdBy;
    }
    if (processedQuery.searchString) {
      filter.$or = [
        { country: { $regex: processedQuery.searchString, $options: 'i' } },
        { city: { $regex: processedQuery.searchString, $options: 'i' } },
        { streetAddress: { $regex: processedQuery.searchString, $options: 'i' } },
        { addressLine: { $regex: processedQuery.searchString, $options: 'i' } }
      ];
    }

    const result = await this.findWithPagination(
      filter,
      { page: processedQuery.page, pageSize: processedQuery.pageSize },
      { createdAt: -1 },
      'createdBy'
    );

    // Results are automatically processed by the model's virtual field

    return {
      pagination_info: result.pagination,
      records: result.data
    };
  }

  async updateLocation(id: string, data: UpdateLocationServiceData): Promise<ILocation | null> {
    validateObjectId(id, 'Location ID');

    // Validate address if provided
    if (data.addresses && data.addresses.length > 0) {
      const address = data.addresses[0];
      this.validateAddress(address);
    }

    // Check if location exists
    const existingLocation = await this.findById(id);
    ensureExists(existingLocation, 'Location', id);

    const transformedData = this.transformUpdateData(data);
    console.log("🚀 ~ LocationService ~ updateLocation ~ transformedData:", transformedData, id)
    const updatedLocation = await this.updateById(id, transformedData, undefined, 'createdBy');

    return updatedLocation;
  }

  async deleteLocation(id: string): Promise<boolean> {
    validateObjectId(id, 'Location ID');

    // Check if location exists
    const existingLocation = await this.findById(id);
    ensureExists(existingLocation, 'Location', id);

    // Check dependencies (additional business rules can be added here)

    return await this.softDeleteById(id);
  }

  async getLocationsByUserId(userId: string): Promise<ILocation[]> {
    validateUserId(userId);

    const locations = await this.findAll(
      { createdBy: userId, deletedAt: null },
      undefined,
      'createdBy'
    );

    return locations;
  }

  async getAllLocations(): Promise<ILocation[]> {
    const locations = await this.findAll(
      { deletedAt: null },
      undefined,
      'createdBy'
    );

    return locations;
  }

  // Private helper methods for business logic

  private validateAddress(address: any): void {
    if (!address.country || !address.city || !address.timeZone || !address.streetAddress || !address.zip) {
      throw AppError.badRequest('Address is missing required fields');
    }

    // Additional validation logic
    if (address.zip.length < 3) {
      throw AppError.badRequest('Address has invalid zip code');
    }
  }

  private transformLocationData(data: CreateLocationServiceData): any {
    return {
      country: data.address.country,
      state: data.address.state === null ? undefined : data.address.state,
      city: data.address.city,
      timeZone: data.address.timeZone,
      addressLine: data.address.addressLine === null ? undefined : data.address.addressLine,
      streetAddress: data.address.streetAddress,
      zip: data.address.zip,
      createdBy: data.createdBy // User ID from JWT (already validated)
    };
  }

  private transformUpdateData(data: UpdateLocationServiceData): any {
    const updateData: any = { updatedAt: new Date() };

    if (data.addresses && data.addresses.length > 0) {
      const address = data.addresses[0];
      updateData.country = address.country;
      updateData.state = address.state === null ? undefined : address.state;
      updateData.city = address.city;
      updateData.timeZone = address.timeZone;
      updateData.addressLine = address.addressLine === null ? undefined : address.addressLine;
      updateData.streetAddress = address.streetAddress;
      updateData.zip = address.zip;
    }

    return updateData;
  }

  private validatePaginationQuery(query: LocationServiceQuery): LocationServiceQuery {
    const { page = 1, pageSize = 10 } = query;
    validatePaginationParams(page, pageSize);
    return { ...query, page, pageSize };
  }

  private processSearchQuery(query: LocationServiceQuery): LocationServiceQuery {
    const { searchString } = query;

    if (searchString && searchString.length < 2) {
      throw AppError.badRequest('Search string must be at least 2 characters long');
    }

    return query;
  }

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}

export default LocationService;
