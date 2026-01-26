import { Response, Request } from "express";
import { ORGANIZATION_CREATED, ORGANIZATION_DELETED, ORGANIZATION_FETCHED, ORGANIZATIONS_FETCHED, ORGANIZATION_NOT_FOUND, ORGANIZATION_UPDATED } from "../constants/appMessages";
import OrganizationService from "../services/db/organizationService";
import { AppError } from "../common/errors/AppError";
import { sendSuccessResp, sendPaginatedResponse } from "../utils/respUtils";
import { asyncHandler } from "../common/middlewares/errorHandler";
import { log } from "console";
import { sendCSVResponse } from "../utils/csvGenerator";

class OrganizationController {
  private organizationService = new OrganizationService();

  // Create organization
  createOrganization = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user_payload;
    const requestData = req.body;
console.log("Create Organization Request Data:", requestData);
    // Basic validation
    if (!requestData.organizationName || !requestData.email) {
      throw AppError.badRequest("Organization name, email, and primary admin are required");
    }

    const organization = await this.organizationService.createOrganization({
      organizationName: requestData.organizationName,
      email: requestData.email,
      contactNumber: requestData.contactNumber,
      description: requestData.description,
      status: requestData.status,
      primaryAdmin: requestData.primaryAdmin,
      locations: requestData.locations || [],
      createdBy: user._id
    });

    return sendSuccessResp(res, 201, ORGANIZATION_CREATED, organization, req);
  });

  // Get organization by ID
  getOrganizationById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    if (!id) {
      throw AppError.badRequest("Organization ID is required");
    }

    const organization = await this.organizationService.getOrganizationById(id);

    if (!organization) {
      throw AppError.notFound(ORGANIZATION_NOT_FOUND);
    }

    return sendSuccessResp(res, 200, ORGANIZATION_FETCHED, organization, req);
  });

  // Get organizations with pagination
  getOrganizationsPaginated = asyncHandler(async (req: Request, res: Response) => {
    const page = +(req.query.page as string) || 1;
    const pageSize = +(req.query.page_size as string) || 10;
    const searchString = req.query.search_string as string | undefined;
    const status = req.query.status as string | undefined;
    const user = (req as any).user_payload;

    const query = {
      page,
      pageSize,
      searchString,
      status,
      createdBy: user?._id // Optional, for filtering if user is logged in
    };

    const result = await this.organizationService.getOrganizationsPaginated(query);

    return sendPaginatedResponse(res, ORGANIZATIONS_FETCHED, result.records, result.pagination_info, req);
  });

  // Update organization by ID
  updateOrganization = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const requestData = req.body;

    if (!id) {
      throw AppError.badRequest("Organization ID is required");
    }

    const organization = await this.organizationService.updateOrganization(id, requestData);

    if (!organization) {
      throw AppError.notFound(ORGANIZATION_NOT_FOUND);
    }

    return sendSuccessResp(res, 200, ORGANIZATION_UPDATED, organization, req);
  });

  // Delete organization by ID (soft delete)
  deleteOrganization = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    if (!id) {
      throw AppError.badRequest("Organization ID is required");
    }

    const deleted = await this.organizationService.deleteOrganization(id);

    if (!deleted) {
      throw AppError.notFound(ORGANIZATION_NOT_FOUND);
    }

    return sendSuccessResp(res, 200, ORGANIZATION_DELETED, undefined, req);
  });

  // Get organizations by current user
  getMyOrganizations = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user_payload;

    const organizations = await this.organizationService.getOrganizationsByUserId(user._id);

    return sendSuccessResp(res, 200, ORGANIZATIONS_FETCHED, organizations, req);
  });

  // Get all organizations without pagination
  getAllOrganizations = asyncHandler(async (req: Request, res: Response) => {
    const organizations = await this.organizationService.getAllOrganizations();

    return sendSuccessResp(res, 200, ORGANIZATIONS_FETCHED, organizations, req);
  });

  // Export organizations as CSV
  exportOrganizationsCSV = asyncHandler(async (req: Request, res: Response) => {
    const searchString = req.body.searchString as string | undefined;
    const createdBy = req.body.createdBy as string | undefined;

    const query = {
      searchString,
      createdBy
    };

    const organizations = await this.organizationService.exportOrganizationsAsCSV(query);
    
    return sendCSVResponse(res, organizations, 'organizations');
  });

  // Bulk update organization status
  bulkUpdateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { organizationIds, status } = req.body;

    // Validation
    if (!organizationIds || !Array.isArray(organizationIds) || organizationIds.length === 0) {
      throw AppError.badRequest("Organization IDs array is required");
    }

    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      throw AppError.badRequest("Valid status is required (active, inactive, suspended)");
    }

    const result = await this.organizationService.bulkUpdateStatus(organizationIds, status);

    return sendSuccessResp(res, 200, `${result.modifiedCount} organization(s) status updated to ${status}`, {
      modifiedCount: result.modifiedCount,
      status: status
    }, req);
  });
}

export default OrganizationController;
