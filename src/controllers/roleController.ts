import { Response, Request } from "express";
import { ROLE_CREATED, ROLE_UPDATED, ROLE_FETCHED, ROLES_FETCHED, ROLE_NOT_FOUND, ROLE_DELETED } from "../constants/appMessages";
import RoleService from "../services/db/roleService";
import { AppError } from "../common/errors/AppError";
import { sendSuccessResp, sendPaginatedResponse } from "../utils/respUtils";
import { asyncHandler } from "../common/middlewares/errorHandler";
import { sendCSVResponse } from "../utils/csvGenerator";

class RoleController {
    private roleService = new RoleService();

    // Create role
    createRole = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user_payload;
        const requestData = req.body;

        const role = await this.roleService.createRole({
            name: requestData.name,
            description: requestData.description,
            permissions: requestData.permissions,
            createdBy: user?.user_id
        });

        return sendSuccessResp(res, 201, ROLE_CREATED, role, req);
    });

    // Update role
    updateRole = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const requestData = req.body;

        if (!id) {
            throw AppError.badRequest("Role ID is required");
        }

        const role = await this.roleService.updateRole(id, {
            name: requestData.name,
            description: requestData.description,
            permissions: requestData.permissions
        });

        if (!role) {
            throw AppError.notFound(ROLE_NOT_FOUND);
        }

        return sendSuccessResp(res, 200, ROLE_UPDATED, role, req);
    });

    // Get role by ID
    getRoleById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!id) {
            throw AppError.badRequest("Role ID is required");
        }

        const role = await this.roleService.getRoleById(id);

        if (!role) {
            throw AppError.notFound(ROLE_NOT_FOUND);
        }

        return sendSuccessResp(res, 200, ROLE_FETCHED, role, req);
    });

  // Get roles with pagination
  getRolesPaginated = asyncHandler(async (req: Request, res: Response) => {
    const page = +(req.query.page as string) || 1;
    const pageSize = +(req.query.page_size as string) || 10;
    const searchString = req.query.search_string as string | undefined;
    const permissionSection = req.query.permission_section as string | undefined;

    const query = {
      page,
      pageSize,
      searchString,
      permissionSection
    };

    const result = await this.roleService.getRolesPaginated(query);

    return sendPaginatedResponse(res, ROLES_FETCHED, result.records, result.pagination_info, req);
  });

    // Delete role
    deleteRole = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!id) {
            throw AppError.badRequest("Role ID is required");
        }

        const deleted = await this.roleService.deleteById(id);

        if (!deleted) {
            throw AppError.notFound(ROLE_NOT_FOUND);
        }

        return sendSuccessResp(res, 200, ROLE_DELETED, undefined, req);
    });

    // Get all roles without pagination
    getAllRoles = asyncHandler(async (req: Request, res: Response) => {
        const roles = await this.roleService.getAllRoles();
        return sendSuccessResp(res, 200, ROLES_FETCHED, roles, req);
    });

    // Export roles as CSV
    exportRolesCSV = asyncHandler(async (req: Request, res: Response) => {
        const searchString = req.body.searchString as string | undefined;
        const permissionSection = req.body.permissionSection as string | undefined;

        const query = {
            searchString,
            permissionSection
        };

        const roles = await this.roleService.exportRolesAsCSV(query);
        
        return sendCSVResponse(res, roles, 'roles');
    });
}

export default RoleController;
