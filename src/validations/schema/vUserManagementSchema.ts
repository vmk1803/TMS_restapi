import {
  array,
  boolean,
  custom,
  InferOutput,
  minLength,
  nonEmpty,
  nullish,
  object,
  optional,
  pipe,
  string,
  regex,
  union,
  literal
} from "valibot";
import {
  USER_FIRST_NAME_REQUIRED,
  USER_FIRST_NAME_INVALID,
  USER_LAST_NAME_REQUIRED,
  USER_LAST_NAME_INVALID,
  USER_EMAIL_REQUIRED,
  USER_EMAIL_INVALID,
  USER_EMAIL_ALREADY_EXISTS,
  USER_MOBILE_REQUIRED,
  USER_MOBILE_INVALID,
  USER_GENDER_REQUIRED,
  USER_GENDER_INVALID,
  USER_PASSWORD_REQUIRED,
  USER_PASSWORD_INVALID,
  USER_PASSWORD_TOO_SHORT,
  USER_ROLE_INVALID,
  USER_DEPARTMENT_INVALID,
  USER_ORGANIZATION_INVALID,
  USER_LOCATION_INVALID,
  USER_REPORTING_MANAGER_INVALID,
  USER_PASSWORD_SETTING_INVALID,
  USER_STATUS_REQUIRED,
  USER_STATUS_INVALID
} from "../../constants/appMessages";
import { isValidObjectId } from "../../common/utils/validationHelpers";

// Asset Schema
const VAssetSchema = object({
  assetId: pipe(
    string(USER_EMAIL_INVALID),
    nonEmpty("Asset ID is required")
  ),
  assetName: pipe(
    string(USER_EMAIL_INVALID),
    nonEmpty("Asset name is required")
  )
});

// Organization Details Schema
const VOrganizationDetailsSchema = object({
  role: pipe(
    string(USER_ROLE_INVALID),
    custom((value) => isValidObjectId(value as string), USER_ROLE_INVALID)
  ),
  department: pipe(
    string(USER_DEPARTMENT_INVALID),
    custom((value) => isValidObjectId(value as string), USER_DEPARTMENT_INVALID)
  ),
  organization: pipe(
    string(USER_ORGANIZATION_INVALID),
    custom((value) => isValidObjectId(value as string), USER_ORGANIZATION_INVALID)
  ),
  location: pipe(
    string(USER_LOCATION_INVALID),
    custom((value) => isValidObjectId(value as string), USER_LOCATION_INVALID)
  ),
  reportingManager: optional(
    pipe(
      string(USER_REPORTING_MANAGER_INVALID),
      custom((value) => isValidObjectId(value as string), USER_REPORTING_MANAGER_INVALID)
    )
  )
});

// Create User Schema
const VCreateUserSchema = object({
  firstName: pipe(
    string(USER_FIRST_NAME_INVALID),
    nonEmpty(USER_FIRST_NAME_REQUIRED),
    minLength(2, "First name must be at least 2 characters")
  ),
  lastName: pipe(
    string(USER_LAST_NAME_INVALID),
    nonEmpty(USER_LAST_NAME_REQUIRED),
    minLength(1, "Last name is required")
  ),
  email: pipe(
    string(USER_EMAIL_INVALID),
    nonEmpty(USER_EMAIL_REQUIRED),
    regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, USER_EMAIL_INVALID)
  ),
  mobileNumber: pipe(
    string(USER_MOBILE_INVALID),
    nonEmpty(USER_MOBILE_REQUIRED),
    regex(/^[0-9+\-\s()]{10,}$/, USER_MOBILE_INVALID)
  ),
  gender: pipe(
    string(USER_GENDER_INVALID),
    nonEmpty(USER_GENDER_REQUIRED)
  ),
  active: optional(boolean()),
  organizationDetails: optional(VOrganizationDetailsSchema),
  password: optional(
    pipe(
      string(USER_PASSWORD_INVALID),
      minLength(8, USER_PASSWORD_TOO_SHORT)
    )
  ),
  passwordSetting: optional(
    pipe(
      string(USER_PASSWORD_SETTING_INVALID),
      union([
        literal("manual"),
        literal("auto-generate")
      ])
    )
  ),

  profilePic: optional(string()),
  assets: optional(array(VAssetSchema))
});

// Update User Schema (all fields optional)
const VUpdateUserSchema = object({
  firstName: optional(
    pipe(
      string(USER_FIRST_NAME_INVALID),
      minLength(2, "First name must be at least 2 characters")
    )
  ),
  lastName: optional(
    pipe(
      string(USER_LAST_NAME_INVALID),
      minLength(1, "Last name is required")
    )
  ),
  email: optional(
    pipe(
      string(USER_EMAIL_INVALID),
      regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, USER_EMAIL_INVALID)
    )
  ),
  mobileNumber: optional(
    pipe(
      string(USER_MOBILE_INVALID),
      regex(/^[0-9+\-\s()]{10,}$/, USER_MOBILE_INVALID)
    )
  ),
  gender: optional(
    string(USER_GENDER_INVALID)
  ),
  active: optional(boolean()),
  organizationDetails: optional(VOrganizationDetailsSchema),
  password: optional(
    pipe(
      string(USER_PASSWORD_INVALID),
      minLength(8, USER_PASSWORD_TOO_SHORT)
    )
  ),
  passwordSetting: optional(
    pipe(
      string(USER_PASSWORD_SETTING_INVALID),
      union([
        literal("manual"),
        literal("auto-generate")
      ])
    )
  ),

  profilePic: optional(string()),
  assets: optional(array(VAssetSchema))
});

export { VCreateUserSchema, VUpdateUserSchema, VOrganizationDetailsSchema, VAssetSchema };

export type ValidatedCreateUser = InferOutput<typeof VCreateUserSchema>;
export type ValidatedUpdateUser = InferOutput<typeof VUpdateUserSchema>;
