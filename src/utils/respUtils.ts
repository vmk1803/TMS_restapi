import { Response, Request } from "express";
import { AppRespData, SuccessResp } from "../types/app.types";
import { customLogger } from "./logger";

// Success response utility
export const sendSuccessResp = (
  res: Response,
  statusCode: number,
  message: string,
  data?: AppRespData,
  req?: Request
) => {
  const user = (req as any)?.user || (req as any)?.user_payload;

  const response: SuccessResp = {
    status: statusCode,
    success: true,
    message,
  };

  if (data) {
    response.data = data;
  }

  // Log the success response
  customLogger(statusCode, {
    user: user,
    status: statusCode,
    message: message,
    method: req?.method,
    url: req?.url,
    query: req?.query,
  }, message, user);

  return res.status(statusCode).json(response);
};

// Specific status code response utilities
export const sendOK = (res: Response, message: string = 'Success', data?: AppRespData, req?: Request) => {
  return sendSuccessResp(res, 200, message, data, req);
};

export const sendCreated = (res: Response, message: string = 'Resource created successfully', data?: AppRespData, req?: Request) => {
  return sendSuccessResp(res, 201, message, data, req);
};

export const sendNoContent = (res: Response, message: string = 'No content', req?: Request) => {
  return sendSuccessResp(res, 204, message, undefined, req);
};

export const sendAccepted = (res: Response, message: string = 'Request accepted', data?: AppRespData, req?: Request) => {
  return sendSuccessResp(res, 202, message, data, req);
};

// Pagination response utility
export const sendPaginatedResponse = (
  res: Response,
  message: string,
  data: any,
  pagination: any,
  req?: Request
) => {
  const response = {
    success: true,
    status: 200,
    message,
    data: {
      pagination_info: pagination,
      records: data
    }
  };

  const user = (req as any)?.user || (req as any)?.user_payload;

  customLogger(200, {
    user: user,
    status: 200,
    message: message,
    method: req?.method,
    url: req?.url,
    total_records: pagination?.total_records,
    page: pagination?.current_page
  }, message, user);

  return res.status(200).json(response);
};

// Error response utility (for non-throwing errors)
export const sendErrorResp = (
  res: Response,
  statusCode: number,
  message: string,
  details?: any,
  req?: Request
) => {
  const user = (req as any)?.user || (req as any)?.user_payload;

  const errorResponse = {
    success: false,
    status: statusCode,
    message,
    details: process.env.NODE_ENV === 'development' ? details : undefined
  };

  customLogger(statusCode, {
    user: user,
    status: statusCode,
    message: message,
    method: req?.method,
    url: req?.url,
    details
  }, message, user);

  return res.status(statusCode).json(errorResponse);
};

// Common response helpers
export const sendBadRequest = (res: Response, message: string = 'Bad request', details?: any, req?: Request) => {
  return sendErrorResp(res, 400, message, details, req);
};

export const sendUnauthorized = (res: Response, message: string = 'Unauthorized', req?: Request) => {
  return sendErrorResp(res, 401, message, undefined, req);
};

export const sendForbidden = (res: Response, message: string = 'Forbidden', req?: Request) => {
  return sendErrorResp(res, 403, message, undefined, req);
};

export const sendNotFound = (res: Response, message: string = 'Resource not found', req?: Request) => {
  return sendErrorResp(res, 404, message, undefined, req);
};

export const sendConflict = (res: Response, message: string = 'Resource conflict', details?: any, req?: Request) => {
  return sendErrorResp(res, 409, message, details, req);
};

export const sendUnprocessableEntity = (res: Response, message: string = 'Validation failed', details?: any, req?: Request) => {
  return sendErrorResp(res, 422, message, details, req);
};
