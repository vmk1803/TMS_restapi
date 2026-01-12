import express, { Response, Request } from "express";
import {
  GROUP_CREATED,
  GROUP_DELETED,
  GROUP_FETCHED,
  GROUPS_FETCHED,
  GROUP_NOT_FOUND,
  GROUP_UPDATED,
  GROUP_VALIDATION_ERROR
} from "../constants/appMessages";
import GroupService from "../services/db/groupService";
import { AppError } from "../common/errors/AppError";
import { sendSuccessResp, sendPaginatedResponse } from "../utils/respUtils";
import { validateRequest } from "../validations/validationRequest";
import { ValidatedUpdateGroup } from "../validations/schema/vGroupSchema";
import { asyncHandler } from "../common/middlewares/errorHandler";
import { safeParseAsync, flatten } from "valibot";
import { VGroupSchema } from "../validations/schema/vGroupSchema";
import { sendCSVResponse } from "../utils/csvGenerator";

class GroupController {
  private groupService = new GroupService();

  // Create group
  createGroup = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user_payload;
    const requestData = req.body;

    // Basic data presence check
    if (!requestData || !requestData.name || !requestData.department || !requestData.manager || !requestData.members) {
      throw AppError.badRequest("Group data is required");
    }

    // Validate request data
    const validation = await safeParseAsync(VGroupSchema, requestData, {
      abortPipeEarly: true,
    });

    if (!validation.success) {
      const errors = flatten(validation.issues).nested;
      throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
    }

    // Create group
    const group = await this.groupService.createGroup({
      name: validation.output.name,
      department: validation.output.department,
      manager: validation.output.manager,
      members: validation.output.members,
      description: validation.output.description || undefined,
      createdBy: user._id
    });

    return sendSuccessResp(res, 201, GROUP_CREATED, group, req);
  });

  // Get group by ID
  getGroupById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw AppError.badRequest("Group ID is required");
    }

    const group = await this.groupService.getGroupById(id);

    if (!group) {
      throw AppError.notFound(GROUP_NOT_FOUND);
    }

    return sendSuccessResp(res, 200, GROUP_FETCHED, group, req);
  });

  // Get groups with pagination and filters
  getGroupsPaginated = asyncHandler(async (req: Request, res: Response) => {
    const page = +(req.query.page as string) || 1;
    const pageSize = +(req.query.page_size as string) || 10;
    const searchString = req.query.search_string as string | undefined;
    const department = req.query.department as string | undefined;

    const query = {
      page,
      pageSize,
      search_string: searchString,
      department
    };

    const result = await this.groupService.getGroupsPaginated(query);

    return sendPaginatedResponse(res, GROUPS_FETCHED, result.records, result.pagination_info, req);
  });

  // Update group by ID
  updateGroup = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const requestData = req.body;

    if (!id) {
      throw AppError.badRequest("Group ID is required");
    }

    const validatedData = await validateRequest<ValidatedUpdateGroup>("group:update", requestData, GROUP_VALIDATION_ERROR);

    const group = await this.groupService.updateGroup(id, {
      name: validatedData.name || undefined,
      department: validatedData.department || undefined,
      manager: validatedData.manager || undefined,
      members: validatedData.members || undefined,
      description: validatedData.description || undefined
    });

    if (!group) {
      throw AppError.notFound(GROUP_NOT_FOUND);
    }

    return sendSuccessResp(res, 200, GROUP_UPDATED, group, req);
  });

  // Delete group by ID (soft delete)
  deleteGroup = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw AppError.badRequest("Group ID is required");
    }

    const deleted = await this.groupService.deleteGroup(id);

    if (!deleted) {
      throw AppError.notFound(GROUP_NOT_FOUND);
    }

    return sendSuccessResp(res, 200, GROUP_DELETED, undefined, req);
  });

  // Get all groups without pagination
  getAllGroups = asyncHandler(async (req: Request, res: Response) => {
    const groups = await this.groupService.getAllGroups();

    return sendSuccessResp(res, 200, GROUPS_FETCHED, groups, req);
  });

  // Export groups as CSV
  exportGroupsCSV = asyncHandler(async (req: Request, res: Response) => {
    const searchString = req.body.search_string as string | undefined;
    const department = req.body.department as string | undefined;
    const status = req.body.status as string | undefined;

    const query = {
      search_string: searchString,
      department,
      status
    };

    const groups = await this.groupService.exportGroupsAsCSV(query);
    
    return sendCSVResponse(res, groups, 'groups');
  });

  // Get group members with pagination and filters
  getGroupMembers = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = +(req.query.page as string) || 1;
    const pageSize = +(req.query.page_size as string) || 10;
    const searchString = req.query.search_string as string | undefined;
    const department = req.query.department as string | undefined;
    const status = req.query.status as string | undefined;

    if (!id) {
      throw AppError.badRequest("Group ID is required");
    }

    const query = {
      page,
      pageSize,
      search_string: searchString,
      department,
      status
    };

    const result = await this.groupService.getGroupMembers(id, query);

    return sendPaginatedResponse(res, "Group members fetched successfully", result.records, result.pagination_info, req);
  });
}

export default GroupController;
