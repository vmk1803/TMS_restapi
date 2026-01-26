import { Response, Request } from "express";
import { DEPARTMENT_CREATED, DEPARTMENT_UPDATED, DEPARTMENT_FETCHED, DEPARTMENTS_FETCHED, DEPARTMENT_NOT_FOUND } from "../constants/appMessages";
import DepartmentService from "../services/db/departmentService";
import { AppError } from "../common/errors/AppError";
import { sendSuccessResp, sendPaginatedResponse } from "../utils/respUtils";
import { asyncHandler } from "../common/middlewares/errorHandler";
import { sendCSVResponse } from "../utils/csvGenerator";

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

    if (!requestData.description || !String(requestData.description).trim()) {
      throw AppError.badRequest("Description is required");
    }

    const department = await this.departmentService.createDepartment({
      name: requestData.name,
      organization: requestData.organization,
      headOfDepartment: requestData.headOfDepartment,
      description: requestData.description,
      createdBy: user._id
    });

    return sendSuccessResp(res, 201, DEPARTMENT_CREATED, department, req);
  });

  // Update department
  updateDepartment = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const requestData = req.body;

    if (!id) {
      throw AppError.badRequest("Department ID is required");
    }

    const department = await this.departmentService.updateDepartment(id, {
      name: requestData.name,
      organization: requestData.organization,
      headOfDepartment: requestData.headOfDepartment,
      description: requestData.description
    });

    if (!department) {
      throw AppError.notFound(DEPARTMENT_NOT_FOUND);
    }

    return sendSuccessResp(res, 200, DEPARTMENT_UPDATED, department, req);
  });

  // Get department by ID
  getDepartmentById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

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
      departmentId,
    };

    const result = await this.departmentService.getDepartmentsPaginated(query);

    return sendPaginatedResponse(res, DEPARTMENTS_FETCHED, result.records, result.pagination_info, req);
  });

  // Delete department
  deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    if (!id) {
      throw AppError.badRequest("Department ID is required");
    }

    const deleted = await this.departmentService.deleteById(id);

    if (!deleted) {
      throw AppError.notFound(DEPARTMENT_NOT_FOUND);
    }

    return sendSuccessResp(res, 200, "Department deleted successfully", undefined, req);
  });

  // Get all departments without pagination
  getAllDepartments = asyncHandler(async (req: Request, res: Response) => {
    const departments = await this.departmentService.getAllDepartments();
    return sendSuccessResp(res, 200, DEPARTMENTS_FETCHED, departments, req);
  });

  // Export departments as CSV
  exportDepartmentsCSV = asyncHandler(async (req: Request, res: Response) => {
    const searchString = req.body.searchString as string | undefined;
    const organizationId = req.body.organizationId as string | undefined;
    const departmentId = req.body.departmentId as string | undefined;

    const query = {
      searchString,
      organizationId,
      departmentId
    };

    const departments = await this.departmentService.exportDepartmentsAsCSV(query);
    
    return sendCSVResponse(res, departments, 'departments');
  });

  // Get departments by organization ID
  getDepartmentsByOrganization = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.params.orgId as string;
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

  // Bulk operations on departments
  bulkOperation = asyncHandler(async (req: Request, res: Response) => {
    const { ids, operation } = req.body;

    // Validation
    if (!Array.isArray(ids) || ids.length === 0) {
      throw AppError.badRequest("IDs array is required and cannot be empty");
    }

    if (!operation || !['delete'].includes(operation)) {
      throw AppError.badRequest("Valid operation is required: 'delete'");
    }

    const result = await this.departmentService.bulkSoftDelete(ids);

    const message = `Bulk ${operation} operation completed`;
    return sendSuccessResp(res, 200, message, result, req);
  });
}

export default DepartmentController;
