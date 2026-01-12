import { Response, Request } from "express";
import { LOCATION_CREATED, LOCATION_DELETED, LOCATION_FETCHED, LOCATIONS_FETCHED, LOCATION_NOT_FOUND, LOCATION_UPDATED, LOCATION_VALIDATION_ERROR } from "../constants/appMessages";
import LocationService from "../services/db/locationService";
import LocationDao from "../dao/locationDao";
import { AppError } from "../common/errors/AppError";
import { sendSuccessResp, sendPaginatedResponse } from "../utils/respUtils";
import { validateRequest } from "../validations/validationRequest";
import { ValidatedUpdateLocation } from "../validations/schema/vLocationSchema";
import { asyncHandler } from "../common/middlewares/errorHandler";
import { safeParseAsync, flatten } from "valibot";
import { VSingleLocationSchema } from "../validations/schema/vLocationSchema";
import { sendCSVResponse } from "../utils/csvGenerator";

class LocationController {
  private locationService = new LocationService();
  private locationDao = new LocationDao();

  // Create multiple locations - one for each address in the array
  createLocation = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user_payload;
    const requestData = req.body;

    // Basic data presence check
    if (!requestData || !requestData.addresses || !Array.isArray(requestData.addresses) || requestData.addresses.length === 0) {
      throw AppError.badRequest("Addresses are required");
    }

    const createdLocations: any[] = [];

    // Validate and create a separate location record for each address
    for (let i = 0; i < requestData.addresses.length; i++) {
      const address = requestData.addresses[i];

      // Validate individual address
      const validation = await safeParseAsync(VSingleLocationSchema, address, {
        abortPipeEarly: true,
      });

      if (!validation.success) {
        const errors = flatten(validation.issues).nested;
        throw new Error(`Address ${i + 1} validation failed: ${JSON.stringify(errors)}`);
      }

      // Create individual location record
      const location = await this.locationService.createLocation({
        address: validation.output, // Single address object
        createdBy: user._id
      });

      createdLocations.push(location);
    }

    return sendSuccessResp(res, 201, `${createdLocations.length} locations created successfully`, createdLocations, req);
  });

  // Get location by ID
  getLocationById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw AppError.badRequest("Location ID is required");
    }

    const location = await this.locationService.getLocationById(id);

    if (!location) {
      throw AppError.notFound(LOCATION_NOT_FOUND);
    }

    return sendSuccessResp(res, 200, LOCATION_FETCHED, location, req);
  });

  // Get locations with pagination and organization data
  getLocationsPaginated = asyncHandler(async (req: Request, res: Response) => {
    const page = +(req.query.page as string) || 1;
    const pageSize = +(req.query.page_size as string) || 10;
    const searchString = req.query.search_string as string | undefined;
    const organizationId = req.query.organization_id as string | undefined;

    const query = {
      page,
      pageSize,
      searchString,
      organizationId
      // Removed createdBy filter to show all locations to authenticated users
    };

    // Use DAO with aggregation to include organization data
    const result = await this.locationDao.getLocationsWithOrganization(query);

    return sendPaginatedResponse(res, LOCATIONS_FETCHED, result.records, result.pagination_info, req);
  });

  // Update location by ID - Controller only checks basic data presence
  updateLocation = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const requestData = req.body;

    if (!id) {
      throw AppError.badRequest("Location ID is required");
    }

    const validatedData = await validateRequest<ValidatedUpdateLocation>("location:update", requestData, LOCATION_VALIDATION_ERROR);

    const location = await this.locationService.updateLocation(id, {
      addresses: validatedData.addresses || undefined
    });

    if (!location) {
      throw AppError.notFound(LOCATION_NOT_FOUND);
    }

    return sendSuccessResp(res, 200, LOCATION_UPDATED, location, req);
  });

  // Delete location by ID (soft delete)
  deleteLocation = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw AppError.badRequest("Location ID is required");
    }

    const deleted = await this.locationService.deleteLocation(id);

    if (!deleted) {
      throw AppError.notFound(LOCATION_NOT_FOUND);
    }

    return sendSuccessResp(res, 200, LOCATION_DELETED, undefined, req);
  });

  // Get locations by current user
  getMyLocations = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user_payload;

    const locations = await this.locationService.getLocationsByUserId(user._id);

    return sendSuccessResp(res, 200, LOCATIONS_FETCHED, locations, req);
  });

  // Get all locations without pagination
  getAllLocations = asyncHandler(async (req: Request, res: Response) => {
    const locations = await this.locationService.getAllLocations();

    return sendSuccessResp(res, 200, LOCATIONS_FETCHED, locations, req);
  });

  // Export locations as CSV
  exportLocationsCSV = asyncHandler(async (req: Request, res: Response) => {
    const searchString = req.body.searchTerm as string | undefined;  // Changed from searchString to searchTerm
    const organizationId = req.body.organizationId as string | undefined;

    const query = {
      searchString,  // Keep internal property name as searchString since service expects this
      organizationId
    };

    console.log("Export Locations CSV Query:", query);

    const locations = await this.locationService.exportLocationsAsCSV(query);
    
    return sendCSVResponse(res, locations, 'locations');
  });
}

export default LocationController;
