import { BaseService, PaginationOptions, PaginatedResult } from '../services/BaseService';
import Location, { ILocation } from '../models/Location';
import Organization from '../models/Organization';
import { AppError } from '../common/errors/AppError';
import { validateObjectId, validatePaginationParams } from '../common/utils/validationHelpers';
import mongoose from 'mongoose';

export interface LocationWithOrganization {
  id: string;
  country: string;
  state?: string;
  city: string;
  timeZone: string;
  addressLine?: string;
  streetAddress: string;
  zip: string;
  userCount?: number;
  createdBy?: any;
  createdAt?: Date;
  updatedAt?: Date;
  organization?: {
    _id: string;
    organizationName: string; // Renamed from 'name'
    email: string;
  };
}

export interface LocationServiceQuery {
  page?: number;
  pageSize?: number;
  searchString?: string;
  createdBy?: string;
  organizationId?: string;
}

export interface PaginatedLocationsWithOrgResult {
  pagination_info: {
    total_records: number;
    total_pages: number;
    page_size: number;
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
  };
  records: LocationWithOrganization[];
}

class LocationDao extends BaseService<ILocation> {
  constructor() {
    super(Location);
  }

  /**
   * Get locations with organization data using aggregation
   */
  async getLocationsWithOrganization(query: LocationServiceQuery): Promise<PaginatedLocationsWithOrgResult> {
    const validatedQuery = this.validatePaginationQuery(query);
    const processedQuery = this.processSearchQuery(validatedQuery);

    // Build filter for aggregation
    const matchFilter: any = { deletedAt: null };
    if (processedQuery.createdBy) {
      matchFilter.createdBy = processedQuery.createdBy;
    }

    // Search filter for locations
    if (processedQuery.searchString) {
      matchFilter.$or = [
        { country: { $regex: processedQuery.searchString, $options: 'i' } },
        { city: { $regex: processedQuery.searchString, $options: 'i' } },
        { streetAddress: { $regex: processedQuery.searchString, $options: 'i' } },
        { addressLine: { $regex: processedQuery.searchString, $options: 'i' } }
      ];
    }

    // Aggregation pipeline to join with organizations
    const aggregationPipeline = [
      // Match locations
      { $match: matchFilter },

      // Lookup organizations that have this location in their locations array
      {
        $lookup: {
          from: 'organizations',
          let: { locationId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    '$$locationId',
                    {
                      $map: {
                        input: '$locations',
                        as: 'locId',
                        in: { $toObjectId: '$$locId' }
                      }
                    }
                  ]
                },
                deletedAt: null
              }
            },
            {
              $project: {
                _id: 1,
                organizationName: 1, // Renamed from 'name'
                email: 1
              }
            }
          ],
          as: 'organization'
        }
      },

      // Debug: Add intermediate logging
      {
        $addFields: {
          debug_locationId: '$_id',
          debug_organizationCount: { $size: '$organization' }
        }
      },

      // Unwind organization array (take first match if multiple)
      {
        $addFields: {
          organization: { $arrayElemAt: ['$organization', 0] }
        }
      },

      // Filter by organization if specified
      ...(processedQuery.organizationId ? [{
        $match: {
          'organization._id': this.toObjectId(processedQuery.organizationId)
        }
      }] : []),

      // Lookup users assigned to this location
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'organizationDetails.location',
          as: 'assignedUsers'
        }
      },

      // Add user count field (only count active, non-deleted users)
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
      { $sort: { createdAt: -1 as const } },

      // Pagination
      { $skip: ((processedQuery.page! - 1) * processedQuery.pageSize!) },
      { $limit: processedQuery.pageSize! }
    ];

    // Execute aggregation
    const [result] = await this.model.aggregate([
      ...aggregationPipeline,
      {
        $group: {
          _id: null,
          records: { $push: '$$ROOT' },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    // If no results, return empty
    if (!result) {
      return {
        pagination_info: {
          total_records: 0,
          total_pages: 0,
          page_size: processedQuery.pageSize!,
          current_page: processedQuery.page!,
          next_page: null,
          prev_page: null
        },
        records: []
      };
    }

    // Get total count for pagination
    const totalCountResult = await this.model.aggregate([
      { $match: matchFilter },
      { $count: 'total' }
    ]);

    const totalCount = totalCountResult.length > 0 ? totalCountResult[0].total : 0;

    // Transform records to include id field and remove MongoDB fields
    const transformedRecords: LocationWithOrganization[] = result.records.map((record: any) => ({
      id: record._id.toString(),
      country: record.country,
      state: record.state,
      city: record.city,
      timeZone: record.timeZone,
      addressLine: record.addressLine,
      streetAddress: record.streetAddress,
      zip: record.zip,
      userCount: record.userCount || 0,
      createdBy: record.createdBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      organization: record.organization
    }));

    const totalPages = Math.ceil(totalCount / processedQuery.pageSize!);

    return {
      pagination_info: {
        total_records: totalCount,
        total_pages: totalPages,
        page_size: processedQuery.pageSize!,
        current_page: processedQuery.page!,
        next_page: processedQuery.page! < totalPages ? processedQuery.page! + 1 : null,
        prev_page: processedQuery.page! > 1 ? processedQuery.page! - 1 : null
      },
      records: transformedRecords
    };
  }

  /**
   * Get single location with organization data
   */
  async getLocationWithOrganization(id: string): Promise<LocationWithOrganization | null> {
    validateObjectId(id, 'Location ID');

    const aggregationPipeline = [
      { $match: { _id: this.toObjectId(id), deletedAt: null } },
      {
        $lookup: {
          from: 'organizations',
          let: { locationId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    '$$locationId',
                    {
                      $map: {
                        input: '$locations',
                        as: 'locId',
                        in: { $toObjectId: '$$locId' }
                      }
                    }
                  ]
                },
                deletedAt: null
              }
            },
            {
              $project: {
                _id: 1,
                organizationName: 1, // Renamed from 'name'
                email: 1
              }
            }
          ],
          as: 'organization'
        }
      },
      {
        $addFields: {
          organization: { $arrayElemAt: ['$organization', 0] }
        }
      }
    ];

    const [result] = await this.model.aggregate(aggregationPipeline);

    if (!result) {
      return null;
    }

    return {
      id: result._id.toString(),
      country: result.country,
      state: result.state,
      city: result.city,
      timeZone: result.timeZone,
      addressLine: result.addressLine,
      streetAddress: result.streetAddress,
      zip: result.zip,
      createdBy: result.createdBy,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      organization: result.organization
    };
  }

  // Private helper methods
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

  private toObjectId(id: string) {
    return new mongoose.Types.ObjectId(id);
  }
}

export default LocationDao;
