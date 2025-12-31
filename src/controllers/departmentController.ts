import { Response, Request } from "express";
import { DEPARTMENT_CREATED, DEPARTMENT_UPDATED, DEPARTMENT_FETCHED, DEPARTMENTS_FETCHED, DEPARTMENT_NOT_FOUND } from "../constants/appMessages";
import DepartmentService from "../services/db/departmentService";
import { AppError } from "../common/errors/AppError";
import { sendSuccessResp, sendPaginatedResponse } from "../utils/respUtils";
import { asyncHandler } from "../common/middlewares/errorHandler";

class DepartmentController {
  private departmentService = new DepartmentService();

  // Create department
  createDepartment = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user_payload;
    const requestData = req.body;

    // Basic validation
    if (!requestData.name || !requestData.organization) {
      throw AppError.badRequest("Name and organization are required");
    }

    const department = await this.departmentService.createDepartment({
      name: requestData.name,
      organization: requestData.organization,
      headOfDepartment: requestData.headOfDepartment,
      status: requestData.status
    });

    return sendSuccessResp(res, 201, DEPARTMENT_CREATED, department, req);
  });

  // Update department
  updateDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const requestData = req.body;
    console.log("🚀 ~ DepartmentController ~ requestData:", requestData)

    if (!id) {
      throw AppError.badRequest("Department ID is required");
    }

    const department = await this.departmentService.updateDepartment(id, {
      name: requestData.name,
      organization: requestData.organization,
      headOfDepartment: requestData.headOfDepartment,
      status: requestData.status
    });

    if (!department) {
      throw AppError.notFound(DEPARTMENT_NOT_FOUND);
    }

    return sendSuccessResp(res, 200, DEPARTMENT_UPDATED, department, req);
  });

  // Get department by ID
  getDepartmentById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw AppError.badRequest("Department ID is required");
    }

    const department = await this.departmentService.getDepartmentById(id);

    if (!department) {
      throw AppError.notFound(DEPARTMENT_NOT_FOUND);
    }

    return sendSuccessResp(res, 200, DEPARTMENT_FETCHED, department, req);
  });

  // Get departments with pagination
  getDepartmentsPaginated = asyncHandler(async (req: Request, res: Response) => {
    const page = +(req.query.page as string) || 1;
    const pageSize = +(req.query.page_size as string) || 10;
    const searchString = req.query.search_string as string | undefined;
    const organizationId = req.query.organization_id as string | undefined;
    const departmentId = req.query.department_id as string | undefined;

    const query = {
      page,
      pageSize,
      searchString,
      organizationId,
      departmentId
    };

    const result = await this.departmentService.getDepartmentsPaginated(query);

    return sendPaginatedResponse(res, DEPARTMENTS_FETCHED, result.records, result.pagination_info, req);
  });

  // Delete department
  deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw AppError.badRequest("Department ID is required");
    }

    const deleted = await this.departmentService.deleteById(id);

    if (!deleted) {
      throw AppError.notFound(DEPARTMENT_NOT_FOUND);
    }

    return sendSuccessResp(res, 200, "Department deleted successfully", undefined, req);
  });

  // Get departments by organization ID
  getDepartmentsByOrganization = asyncHandler(async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const page = +(req.query.page as string) || 1;
    const pageSize = +(req.query.page_size as string) || 10;
    const searchString = req.query.search_string as string | undefined;

    if (!orgId) {
      throw AppError.badRequest("Organization ID is required");
    }

    const query = {
      page,
      pageSize,
      searchString
    };

    const result = await this.departmentService.getDepartmentsByOrganizationId(orgId, query);

    return sendPaginatedResponse(res, DEPARTMENTS_FETCHED, result.records, result.pagination_info, req);
  });
}

export default DepartmentController;
