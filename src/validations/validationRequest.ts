import { flatten, safeParseAsync } from "valibot";
import { AppActivity, ValidatedRequest } from "../types/app.types";
import BadRequestException from "../exceptions/badRequestException";
import { VForgotPasswordSchema } from "./schema/vForgotPasswordSchema";
import { VLoginSchema } from "./schema/vLoginSchema";
import { VAddUserSchema, VAdminUserSchema, VRegularUserSchema, VResetPasswordByAdminSchema, VResetPasswordSchema, VUpdatePasswordSchema, VUpdateUserProfilePicSchema, VUpdateUserSchema, VUpdateUserStatusSchema } from "./schema/vUserSchema";
import { VLocationSchema, VUpdateLocationSchema, VSingleLocationSchema } from "./schema/vLocationSchema";
export const validateRequest = async<R extends ValidatedRequest>(actionType: AppActivity, reqData: any, errorMessage: string) => {

  let schema;

  switch (actionType) {
    case "user:create-admin-user":
      schema = VAdminUserSchema;
      break;
    case "user:create-regular-user":
      schema = VRegularUserSchema;
      break;
    case "password:update":
      schema = VUpdatePasswordSchema;
      break;
    case "forgot-password":
      schema = VForgotPasswordSchema;
      break;
    case "password:reset":
      schema = VResetPasswordSchema;
      break;
    case "login":
      schema = VLoginSchema;
      break;
    case "user:update-user-status":
      schema = VUpdateUserStatusSchema;
      break;
    case "user:update-user-profile-pic":
      schema = VUpdateUserProfilePicSchema;
      break;
    case "password:reset-by-admin":
      schema = VResetPasswordByAdminSchema;
      break;
    case "user:update-user":
      schema = VUpdateUserSchema;
      break;
    case 'user:add-user':
      schema = VAddUserSchema;
      break;
    case 'location:create':
      schema = VLocationSchema;
      break;
    case 'location:update':
      schema = VUpdateLocationSchema;
      break;
  }

  const validation = await safeParseAsync(schema!, reqData, {
    abortPipeEarly: true,
  });

  if (!validation.success) {
    throw new BadRequestException(errorMessage);
  }

  return validation.output as R;
};
