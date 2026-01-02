import { minLength, nonEmpty, nullish, object, pipe, string, array, InferOutput } from "valibot";
import { ROLE_NAME_INVALID, ROLE_NAME_MISSING, ROLE_NAME_TOO_SHORT, ROLE_DESCRIPTION_INVALID, ROLE_PERMISSIONS_INVALID } from "../../constants/appMessages";
import { PERMISSIONS } from "../../constants/appMessages";

const VRolePermissionsSchema = object({
  projects: array(string(ROLE_PERMISSIONS_INVALID)),
  task: array(string(ROLE_PERMISSIONS_INVALID)),
  users: array(string(ROLE_PERMISSIONS_INVALID)),
  settings: array(string(ROLE_PERMISSIONS_INVALID))
});

const VRoleSchema = object({
  name: pipe(
    string(ROLE_NAME_INVALID),
    nonEmpty(ROLE_NAME_MISSING),
    minLength(3, ROLE_NAME_TOO_SHORT)
  ),
  description: nullish(
    string(ROLE_DESCRIPTION_INVALID)
  ),
  permissions: VRolePermissionsSchema
});

const VUpdateRoleSchema = object({
  name: nullish(
    pipe(
      string(ROLE_NAME_INVALID),
      minLength(3, ROLE_NAME_TOO_SHORT)
    )
  ),
  description: nullish(
    string(ROLE_DESCRIPTION_INVALID)
  ),
  permissions: nullish(
    VRolePermissionsSchema
  )
});

export { VRoleSchema, VUpdateRoleSchema, VRolePermissionsSchema };

export type ValidatedRole = InferOutput<typeof VRoleSchema>;
export type ValidatedUpdateRole = InferOutput<typeof VUpdateRoleSchema>;
