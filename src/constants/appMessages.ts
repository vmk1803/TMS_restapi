export const PROJECT_CREATED = "Project created successfully";
export const PROJECT_NOT_FOUND = "Project not found";
export const PROJECT_FETCHED = "Project details fetched successfully";
export const PROJECT_UPDATED = "Project updated successfully";
export const PROJECT_STATS_FETCHED = "Project statistics fetched successfully";
export const MEMBERS_ADDED = "Members added successfully";
export const DATA_NOT_FOUND = "Data Not Found";
export const PROJECT_TASKS_FETCHED = "Project tasks fetched successfully";
export const NO_TASKS_FOUND = "No tasks found for this project";
export const PROJECTS_FETCHED = "Projects fetched successfully";
export const USERS_ADDED_TO_PROJECT = "Users successfully added to the project";
export const PROJECT_MEMBERS_FETCHED_SUCCESS = "Project members fetched successfully";
export const USER_NOT_FOUND_IN_PROJECT = "User with this ID not found or inactive";
export const PROJECT_MEMBERS_UPDATED = "Project members updated successfully";
export const PROJECT_LOGO_MISSING = "Project logo is required";
export const PROJECT_LOG_INVALID = "Project logo is Invalid";
export const NO_PROJECTS_FOUND_FOR_USER = "No projects found for the user.";
export const PROJECT_HAS_TASKS_ERROR = "Cannot delete the project because tasks are already assigned to it.";
export const PROJECT_INACTIVE_SUCCESS = "Project has been successfully marked as inactive.";
export const PROJECT_ALREADY_INACTIVE = "Project is already inactive";
export const PROJECT_REACTIVATED_SUCCESS = "Project has been successfully marked as active.";
export const PROJECT_ALREADY_ACTIVE = "Project is already active";

export const PROJECT_MEMBER_ID_REQUIRED = "Project member id required";
export const PROJECT_MEMBER_ID_NUMBER = "Project member id must be a number";
export const CANNOT_REMOVE_PROJECT_MEMBER = "This member cannot be removed because they are still assigned to one or more tasks.";

// Tasks
export const TASK_CREATED = "Task added successfully";
export const TASK_FETCHED = "Task details fetched successfully";
export const TASKS_COUNT = "Count of inprogress and completed status of tasks fetched successfully";
export const TASK_STATUS_COUNT_FETCHED = "Task status counts fetched successfully";
export const TASK_ASSIGNMENT_REMOVED = "Task assignment removed successfully";
export const TASK_EDITED_SUCCESS = "Task updated successfully";
export const TASKS_FETCHED = "Tasks fetched successfully";
export const TASKS_COUNT_FETCHED = "Tasks count fetched by project successfully";
export const TASK_STATS_FETCHED = "Task statistics fetched successfully";
export const TASK_COMMENT_ADDED = "Task comment added successfully";
export const TASK_COMMENT_UPDATED = "Task comment updated successfully";
export const TASK_COMMENT_NOT_FOUND = "Task comments not found for this task";
export const TASK_COMMENTS_FETCHED = "Task comments fetches successfully";
export const TASK_COMMENT_DELETED = "Task comment deleted successfully";
export const TASK_ASSIGNED = "Task assignees added successfully";
export const PROJECTS_WITH_TASKS_FETCHED = "Task stats of this project fetched successfully";
export const PROJECTS_TASK_STATS_FETCHED = "Projects with task stats fetched successfully";
export const PROJECT_WITH_TASK_NOT_FOUND = "Projects with tasks not found";

export const TASK_NOT_FOUND = "Task not found";
export const INVALID_INPUT = "Invalid input";
export const TASK_VALIDATION_ERROR = "Validations failed";
export const NO_DATA = "No data";
export const SUCCESS_FETCHED_TASK = "All Tasks details fetched successfully";
export const PROJECT_ID_NOT_FOUND = "Project id not found";
export const USER_ID_NOT_FOUND = "User id not found";
export const TASK_DELETED = "Task deleted successfully";
export const TASK_ARCHIVED = "Task has been archived successfully";
export const INVALID_TASK_ID = "Invalid task id";
export const FAILED_DELETED_TASK = "Failed to delete the task.";
export const TAG_NOT_FOUND = "Tag not found";
export const TAGS_NOT_FOUND = "Tags not found";
export const TAGS_FETCHED = "Tags fetched successfully.";
export const TAG_ALREADY_EXISTS = "Tag already exists.";

export const TASK_STATUS_UPDATED = "Task status updated successfully";
export const PRIORITY_STATUS_UPDATED = "Task priority updated successfully";
export const NO_OVER_DUE_TASKS = "No overdue tasks to update";
export const TASKS_UPDATED_OVERDUE = "Tasks fetched and task statuses updated to OVERDUE successfully";
export const TASK_IS_ARCHIVE = "Task is already archived";
export const TASK_IS_ACTIVE = "Task is already restored";
export const TASK_RESTORE_FAIL = "Failed to restore the task";
export const TASK_RESTORE_SUCCESS = "Task has been restored successfully";
export const ARCHIVE_TASKS_FETCHED = "Archived tasks fetched successfully";
export const ARCHIVE_TASKS_COUNT_FETCHED = "Archived tasks count fetched successfully";

// update task validations
export const UPDATE_TITLE_REQUIRED = "Title is required";
export const UPDATE_DESCRIPTION_INVALID = "Description must be a string.";
export const UPDATE_PRIORITY_INVALID = "Priority must one of these.";
export const UPDATE_STATUS_INVALID = "Status must one of these.";
export const UPDATE_DUE_DATE_INVALID = "Due date is invalid.";
export const UPDATE_PROJECT_ID_INVALID = "Project ID must be a valid integer.";
export const TASK_STATS_FETCHED_SUCCESS = "Task stats fetched successfully";

// Task creation validation messages
export const CREATE_TITLE_REQUIRED = "Title is required.";
export const MIN_LENGTH = "Min 3 letters required";
export const CREATE_REF_ID_REQUIRED = "Reference id is required.";
export const CREATE_DESCRIPTION_INVALID = "Description must be a valid non-empty string.";
export const CREATE_PRIORITY_INVALID = "Priority must one of 'HIGH','MEDIUM','LOW'.";
export const CREATE_STATUS_INVALID = "Must one of 'TODO','IN_PROGRESS','COMPLETED','OVER_DUE'";
export const CREATE_DUE_DATE_INVALID = "Due date is required";
export const DUE_DATE_INVALID = "Due date must between today and the future date.";
export const INVALID_DATE_FORMAT = "Invalid date format";
export const CREATE_PROJECT_ID_REQUIRED = "Project is required.";
export const CREATE_USER_ID_REQUIRED = "User id required and must be a valid number.";
export const INVALID_DUE_DATE = "Invalid due date format";
export const REF_EXISTED = "Ref id alredy exist";
export const DUE_DATE_REQUIRED = "Due date must be between today and the future date.";
export const allowedStatuses = ["TODO", "IN_PROGRESS", "COMPLETED", "OVER_DUE"];
export const allowedPriorities = ["HIGH", "MEDIUM", "LOW"];
export const TAG_REQUIRED = "Tag required";

// Task comments messages

export const COMMENT_ADDED = "Comment added successfully.";
export const INVALID_COMMENT_DATA = "Invalid comment data.";
export const COMMENT_MESSAGE_REQUIRED = "Comment is required";
export const TASK_ID_REQUIRED = "Task id required";

// Tags validation messages
export const TAG_TITLE_REQUIRED = "Tags required";
export const TAG_EXISTED = "Tag already exists for this task";

// Task Assignees validation messages
export const ASSIGNEES_TASK_ID_REQUIRED = "Task id required and valid number";
export const USERS_REQUIRED = "Users required";

export const USER_CREATED = "User created successfully";
export const USER_FETCHED = "User fetched successfully";
export const PASSWORD_UPDATED = "password updated successfully";
export const USERS_FETCHED = "Users fetched successfully";
export const TASK_TAGS_FETCHED = "Task Tags fetched successfully";

export const DEF_SERVICE_RUNNING = "Service is up & running";
export const DEF_SUCCESS_RESP = "Success";
export const DEF_ERROR_RESP = "Internal Server Error";

export const DEF_422 = "Validation Failed";
export const DEF_404 = "Data Not Found";
export const DEF_409 = "Data Conflict Encountered";
export const DEF_401 = "Unauthorized Request";
export const DEF_403 = "Forbidden Request";
export const DEF_400 = "Bad Request";

export const NAME_422 = "Unprocessable Entity";
export const NAME_404 = "Not Found";
export const NAME_409 = "Conflict";
export const NAME_401 = "Unauthorized";
export const NAME_403 = "Forbidden";
export const NAME_400 = "Bad Request";

export const LOGIN_SUCCESS = "Login successful.";
export const PASSWORD_RESET_REQUESTED = "Password reset link sent to your email.";
export const PASSWORD_RESET_SUCCESS = "Password reset successful.";

//Validation mesages
export const PROJECT_VALIDATION_ERROR = "Project Details provided do not meet the required validation criteria";
export const TITLE_REQUIRED = "Title is Required";
export const TITLE_STRING = "Title must be a string";
export const CODE_STRING = "Code must be as string";
export const CODE_REQUIRED = "Code is Required";
export const TIMEZONE_REQUIRED = "Timezone is required";
export const TIMEZONE_STRING = "Timezone must be as string";
export const MEMBERS_REQUIRED = "Project Members are Required";
export const PROJECT_MEMBERS_VALIDATION_ERROR = "Project Members delete validation error";

//Authorization Messages
export const LOGIN_VALIDATION_ERROR = "Login Details provided do not meet the required validation criteria";
export const LOGIN_CREDS_INVALID = "Login Credentials Invalid";
export const PASSWORD_INVALID = "Password is Required";
export const CURRENT_PASSWORD_STRING = "Current password is must be string";
export const CURRENT_PASSWORD_REQUIRED = "Current Password is Required";
export const PASSWORD_SHORT = "Password should be minimum of 8 characters";
export const PASSWORD_REQUIRED = "Password is Required";
export const TOKEN_INVALID = "Authorization Token Invalid";
export const TOKEN_EXPIRED = "Authorization Token Expired";
export const TOKEN_SIG_MISMATCH = "Authorization Token Signature Mismatched";
export const TOKEN_MISSING = "Authorization Token Missing";
export const FORBIDDEN_ACCESS = "You are not authorized to access this resource";
export const USER_PAYLOAD_MISSING = "User Payload Missing";
export const LOGIN_EMAIL_NOT_FOUND = "Given Email not found in the system. Please check with the admin.";
export const LOGIN_DONE = "Login Successful";
export const ACCOUNT_INACTIVE = "Account Inactive. Please contact administrator";
export const RT_NOT_FOUND = "Refresh Token Not Found";
export const TOKENS_GENERATED = "Tokens Generated Successfully";
export const LOGIN_EMAIL_NOT_FOUND_SUPER_ADMIN = "Given Email not found in the system. Please check with the super admin.";

// User Validation Messages
export const FIRST_NAME_INVALID = "First Name Invalid";
export const FIRST_NAME_MISSING = "First Name is Required";
export const FIRST_NAME_TOO_SHORT = "First Name must be minimum of 3 characters";
export const LAST_NAME_INVALID = "Last Name Invalid";
export const LAST_NAME_MISSING = "Last Name is Required";
export const LAST_NAME_TOO_SHORT = "Last Name must be minimum of 1 characters";
export const MIDDLE_NAME_INVALID = "Middle Name Invalid";
export const EMAIL_INVALID = "Email Invalid";
export const EMAIL_MISSING = "Email is Required";
export const EMAIL_EXISTS = "Email Already Exists";
export const PROFILE_PIC_INVALID = "Profile Picture Invalid";
export const USER_TYPE_INVALID = "User Type Invalid";
export const USER_VALIDATION_ERROR = "User Details provided do not meet the required validation criteria";
export const USER_ADDED = "User Added Successfully";
export const USER_DELETED = "User Deleted Successfully";
export const ADMIN_USER_ADDED = "Admin User Added Successfully";
export const USER_NOT_FOUND = "User Not Found";
export const PASSWORDS_NOT_MATCHING = "The passwords do not match";
export const PASSWORDS_VALIDATION_ERROR = "Password Details provided do not meet the required validation criteria";
export const CURRENT_PASSWORD_WRONG = "Provided Current Password is wrong";
export const PASSWORD_CHANGED = "Password Changed Successfully";
export const PASSWORD_RESET_DONE = "Password Reset Done Successfully";
export const FP_EMAIL_ERROR = "Error while sending Email to reset password";
export const FP_EMAIL_SENT = "An email to reset your password is sent to the email provided. Please check your email";
export const RESET_TOKEN_NOT_FOUND = "Reset Token Not Found";
export const FILE_KEY_INVALID = "File Invalid";
export const FILE_KEY_MISSING = "File Required";
export const DATE_REQUIRED = "Date Required";
export const DATE_INVALID = "Date Invalid";
export const USER_UPDATED = "User updated successfully";
export const ADMIN_ALREADY_EXISTS = "Admin already exists in the system. Please add a new Admin using the existing Admin account.";
export const ROLE_REQUIRED = "Role is Required";
export const ROLE_STRING = "Role must be a string";
export const USER_ID_REQUIRED = "User Id is Required";
export const USER_ID_NUMBER = "User Id must be a number";
export const USER_PROFILE_PIC_UPDATED = "User Profile Picture Updated Successfully";
export const DESIGNATION_INVALID = "Designation Invalid";
export const DESIGNATION_MIN_LENGTH = "Designation requires minimum of 3 characters";
export const USER_TYPE_MISSING = "User type is required";
export const PASSWORD_MISSING = "Password is required";
export const USERS_FETCHED_SUCCESS = "List of users fetched successfully";
export const USER_TASK_SUMMARY_FETCHED = "User task summary fetched successfully";
export const USER_DETAILS_FETCHED_SUCCESS = "User Details fetched successfully";

//Task attachments validations

export const TASK_ID_IS_NUMBER = "Task ID must be a number";
export const FILE_NAME_REQUIRED = "File name is required";
export const FILE_NAME_IS_STRING = "File name must be a string";
export const KEY_REQUIRED = "Key is required";
export const KEY_IS_STRING = "Key must be a string";
export const FILE_SIZE_IS_NUMBER = "File size must be a number";
export const UPLOADED_BY_REQUIRED = "Uploaded by is required";
export const UPLOADED_BY_IS_NUMBER = "Uploaded by must be a number";
export const TASK_ATTACHMENT_VALIDATION_ERROR = "Task Attachment Details provided do not meet the required validation criteria";
export const ATTACHMENT_UPLOADED = "Attachment uploaded successfully";
export const USER_ACTIVE_STATUS_REQUIRED = "Active Status is Required";
export const USER_ACTIVE_STATUS_UPDATED = "User Status Updated Successfully";

export const USER_ALREADY_ASSIGNED = "This user is already assigned to the project";
export const USERS_NOT_FOUND = "Users not found";
export const SLUG_ALREADY_USED = "This slug is already used";
export const CODE_ALREADY_USED = "This code is already used";
export const PROJECT_MEMBER_REMOVED = "Project member removed successfully";
export const PROJECT_MEMBER_NOT_FOUND = "Project member not found for this project";
export const PROJECT_DELETED = "Project deleted successfully";

export const PROFILE_PIC_MISSING = "Profile picture URL is required";
export const PROFILE_PIC_TOO_SHORT = "Profile picture URL must be minimum of 3 characters";
export const PROJECT_TITLE_ALREADY_EXISTS = "Project title already exists";
export const PROJECT_CODE_ALREADY_EXISTS = "Project code already exists";
export const SAME_USER_CANNOT_BE_ASSIGNED_TO_THE_SAME_PROJECT = "A user cannot be assigned to the same project more than once.";

export const USER_ID_IS_NUMBER = "User ID must be a number";
export const USER_ID_ARRAY_MIN_LENGTH = "User ID array must have at least one element";
export const TASK_ASSIGNEE_VALIDATION_ERROR = "Task Assignee validation error";
export const TASK_ASSIGNEE_DUPLICATE_ERROR = "This task already assigned to this user";
export const TASK_ASSIGNEE_NOT_FOUND = "Task assignee details not found";
export const TASK_ASSIGNEE_REMOVED = "Task assignee details removed successfully";
export const SUCCESS_FETCHED_TASK_ASSIGNEES = "Task assignees fetched successfully";

export const NO_ATTACHMENTS_FOUND = "No attachments found for this task";
export const ATTACHMENTS_FETCHED = "Task attachments fetched successfully";
export const ATTACHMENT_NOT_FOUND = "Attachment not found";
export const ATTACHMENT_DELETED = "Task Attachment details deleted successfully";

export const FILE_NAME_INVALID = "File Name Invalid";
export const FILE_MISSING = "File Required";
export const FILE_TYPE_MISSING = "File Type Required";
export const FILE_TYPE_INVALID = "File Type Invalid";
export const FILE_VALIDATION_ERROR = "File Details provided do not meet the required validation criteria";

export const PROJECT_TASKS_FETCH_SUCCESS = "Project wise tasks fetched successfully";
export const ADD_TAG_SUCCESS = "Task tag added successfully";
export const REMOVE_TAG_SUCCESS = "Tag removed successfully";
export const STATUS_REQUIRED = "Status is required";
export const PRIORITY_REQUIRED = "Priority is required";

export const STATUS_UPDATE_FAILED = "Failed to update task status";
export const TASK_ACTIVITIES_NOT_FOUND = "Task activities not found";
export const TASK_ACTIVITIES_FETCHED = "Task activities fetched successfully";

//Notifications
export const NOTIFICATION_NOT_FOUND = "Notification not found";
export const NOTIFICATION_MARKED_TRUE = "Notification marked as read successfully";
export const NOTIFICATION_USER_COUNT = "Notification count fetched successfully";
export const NOTIFICATION_MARKED_SUCCESS = "Successfully marked all notifications as read";
export const NOTIFICATIONS_FETCHED_SUCCESS = "Notifications fetched successfully";

//user groups
export const USER_GROUP_ADDED = "User group added successfully";
export const USER_GROUP_ALREADY_EXISTS = "Group name already exists";
export const USER_GROUP_VALIDATION_ERROR = "User Group Details provided do not meet the required validation criteria";
export const USER_ID_MISSING = "User ID is required";
export const GROUP_NAME_MISSING = "Group name is required";
export const GROUP_NAME_TOO_SHORT = "Group name must be minimum of 3 characters";
export const CREATED_BY_MISSING = "Created by is required";
export const GROUP_ID_MISSING = "Group id is required";
export const CREATED_BY_IS_NUMBER = "Created by must be a number";
export const GROUP_ID_IS_NUMBER = "Group id must be a number";
export const ADD_USERS_TO_GROUP_VALIDATION_ERROR = "User details provided do not meet the required validation criteria";
export const USERS_ADDED_TO_GROUP = "Users added to group successfully";
export const USER_GROUPS_FETCHED = "User groups fetched successfully";
export const USER_GROUP_NOT_FOUND = "User group not found";
export const USER_GROUP_UPDATED = "User group updated successfully";
export const USER_GROUP_DETAILS_FETCHED = "User group details fetched successfully";
export const USERS_UPDATED_IN_GROUP = "Users updated in group successfully";
export const USERS_REMOVED_FROM_GROUP = "Users removed from group successfully";
export const USERS_DETAILS_UPDATED_IN_GROUP = "User details updated in group successfully";
export const USER_NOT_FOUND_IN_GROUP = "User is not found in the group";
export const USER_GROUP_DELETED = "User group deleted successfully";

// Role messages
export const ROLE_CREATED = "Role created successfully";
export const ROLE_UPDATED = "Role updated successfully";
export const ROLE_FETCHED = "Role fetched successfully";
export const ROLES_FETCHED = "Roles fetched successfully";
export const ROLE_NOT_FOUND = "Role not found";
export const ROLE_DELETED = "Role deleted successfully";
export const ROLE_VALIDATION_ERROR = "Role Details provided do not meet the required validation criteria";

// Role validation messages
export const ROLE_NAME_INVALID = "Role name must be a valid string";
export const ROLE_NAME_MISSING = "Role name is required";
export const ROLE_NAME_TOO_SHORT = "Role name must be minimum of 3 characters";
export const ROLE_DESCRIPTION_INVALID = "Role description must be a valid string";
export const ROLE_PERMISSIONS_INVALID = "Permissions must be valid permission strings";
export const ROLE_PERMISSIONS_MISSING = "Permissions are required";

// Permission constants
export const PERMISSIONS = {
  CREATE: "CREATE",
  EDIT: "EDIT",
  VIEW: "VIEW",
  DELETE: "DELETE",
  EXPORT: "EXPORT",
  UPDATE: "UPDATE"
} as const;

export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const PROJECT_USER_GROUP_NOT_FOUND = "Project user group not found";
export const PROJECT_USER_GROUP_UPDATED = "Project user group updated successfully";
export const PROJECT_USER_GROUP_DETAILS_FETCHED = "Project user group details fetched successfully";
export const USERS_UPDATED_IN_PROJECT_GROUP = "Users updated in project group successfully";
export const USERS_REMOVED_FROM_PROJECT_GROUP = "Project group removed successfully";
export const PROJECT_USER_GROUPS_FETCHED = "Project user groups fetched successfully";
export const PROJECT_USER_GROUP_VALIDATION_ERROR = "Group details provided do not meet the required validation criteria";
export const REMOVE_USERS_FROM_PROJECT_GROUP_VALIDATION_ERROR = "Group details provided do not meet the required validation criteria";
export const PROJECT_GROUP_ID_MISSING = "Project group id is required";
export const PROJECT_GROUP_ID_IS_NUMBER = "Project group id must be a number";

//task user groups
export const TASK_USER_GROUP_ADDED = "Task user group added successfully";
export const TASK_USER_GROUP_NOT_FOUND = "User group not found in the task";
export const ADD_TASKS_GROUP_VALIDATION_ERROR = "Group details provided do not meet the required validation criteria";
export const TASK_USER_GROUPS_FETCHED = "Task user groups fetched successfully";
export const TASK_USER_GROUP_DETAILS_FETCHED = "Task user group details fetched successfully";
export const TASK_USER_GROUP_UPDATED = "Task user group updated successfully";
export const USERS_REMOVED_FROM_TASK_GROUP = "Task user group removed successfully";
export const REMOVE_USERS_FROM_TASK_GROUP_VALIDATION_ERROR = "Group details provided do not meet the required validation criteria";

// Location messages
export const LOCATION_CREATED = "Location created successfully";
export const LOCATION_UPDATED = "Location updated successfully";
export const LOCATION_DELETED = "Location deleted successfully";
export const LOCATION_FETCHED = "Location fetched successfully";
export const LOCATIONS_FETCHED = "Locations fetched successfully";
export const LOCATION_NOT_FOUND = "Location not found";
export const LOCATION_VALIDATION_ERROR = "Location Details provided do not meet the required validation criteria";

// Organization messages
export const ORGANIZATION_CREATED = "Organization created successfully";
export const ORGANIZATION_UPDATED = "Organization updated successfully";
export const ORGANIZATION_DELETED = "Organization deleted successfully";
export const ORGANIZATION_FETCHED = "Organization fetched successfully";
export const ORGANIZATIONS_FETCHED = "Organizations fetched successfully";
export const ORGANIZATION_NOT_FOUND = "Organization not found";
export const ORGANIZATION_VALIDATION_ERROR = "Organization Details provided do not meet the required validation criteria";

// Location validation messages
export const COUNTRY_REQUIRED = "Country is required";
export const COUNTRY_INVALID = "Country must be a valid string";
export const STATE_INVALID = "State must be a valid string";
export const CITY_REQUIRED = "City is required";
export const CITY_INVALID = "City must be a valid string";
export const TIME_ZONE_REQUIRED = "Time zone is required";
export const TIME_ZONE_INVALID = "Time zone must be a valid string";
export const ADDRESS_LINE_INVALID = "Address line must be a valid string";
export const STREET_ADDRESS_REQUIRED = "Street address is required";
export const STREET_ADDRESS_INVALID = "Street address must be a valid string";
export const ZIP_REQUIRED = "Zip code is required";
export const ZIP_INVALID = "Zip code must be a valid string";
export const ADDRESSES_REQUIRED = "At least one address is required";
export const CREATED_BY_REQUIRED = "Created by is required";

// Department messages
export const DEPARTMENT_CREATED = "Department created successfully";
export const DEPARTMENT_UPDATED = "Department updated successfully";
export const DEPARTMENT_FETCHED = "Department fetched successfully";
export const DEPARTMENTS_FETCHED = "Departments fetched successfully";
export const DEPARTMENT_NOT_FOUND = "Department not found";

// User Management messages
export const USER_MGMT_CREATED = "User created successfully";
export const USER_MGMT_UPDATED = "User updated successfully";
export const USER_MGMT_DELETED = "User deleted successfully";
export const USER_MGMT_FETCHED = "User fetched successfully";
export const USERS_MGMT_FETCHED = "Users fetched successfully";
export const USER_MGMT_NOT_FOUND = "User not found";
export const USER_MGMT_VALIDATION_ERROR = "User Details provided do not meet the required validation criteria";

// User validation messages
export const USER_FIRST_NAME_REQUIRED = "First name is required";
export const USER_FIRST_NAME_INVALID = "First name must be a valid string";
export const USER_LAST_NAME_REQUIRED = "Last name is required";
export const USER_LAST_NAME_INVALID = "Last name must be a valid string";
export const USER_EMAIL_REQUIRED = "Email is required";
export const USER_EMAIL_INVALID = "Email must be a valid email address";
export const USER_EMAIL_ALREADY_EXISTS = "Email already exists";
export const USER_MOBILE_REQUIRED = "Mobile number is required";
export const USER_MOBILE_INVALID = "Mobile number must be a valid string";
export const USER_GENDER_REQUIRED = "Gender is required";
export const USER_GENDER_INVALID = "Gender must be a valid string";
export const USER_PASSWORD_REQUIRED = "Password is required";
export const USER_PASSWORD_INVALID = "Password must be a valid string";
export const USER_PASSWORD_TOO_SHORT = "Password must be at least 8 characters";
export const USER_ROLE_INVALID = "Role must be a valid ObjectId";
export const USER_DEPARTMENT_INVALID = "Department must be a valid ObjectId";
export const USER_ORGANIZATION_INVALID = "Organization must be a valid ObjectId";
export const USER_LOCATION_INVALID = "Location must be a valid ObjectId";
export const USER_REPORTING_MANAGER_INVALID = "Reporting manager must be a valid ObjectId";
export const USER_REPORTING_MANAGER_NOT_FOUND = "Reporting manager not found";
export const USER_CANNOT_BE_OWN_MANAGER = "User cannot be their own reporting manager";
export const USER_PASSWORD_SETTING_INVALID = "Password setting must be 'manual' or 'auto-generate'";
export const USER_STATUS_REQUIRED = "User status is required";
export const USER_STATUS_INVALID = "User status must be a valid string";

// Group messages
export const GROUP_CREATED = "Group created successfully";
export const GROUP_UPDATED = "Group updated successfully";
export const GROUP_DELETED = "Group deleted successfully";
export const GROUP_FETCHED = "Group fetched successfully";
export const GROUPS_FETCHED = "Groups fetched successfully";
export const GROUP_NOT_FOUND = "Group not found";
export const GROUP_VALIDATION_ERROR = "Group Details provided do not meet the required validation criteria";

// Group validation messages
export const GROUP_NAME_REQUIRED = "Group name is required";
export const GROUP_NAME_INVALID = "Group name must be a valid string";
export const GROUP_NAME_MIN_LENGTH = "Group name must be minimum of 3 characters";
export const GROUP_NAME_ALREADY_EXISTS = "Group name already exists";
export const GROUP_DEPARTMENT_REQUIRED = "Department is required";
export const GROUP_DEPARTMENT_INVALID = "Department must be a valid ObjectId";
export const GROUP_MANAGER_REQUIRED = "Manager is required";
export const GROUP_MANAGER_INVALID = "Manager must be a valid ObjectId";
export const GROUP_MEMBERS_REQUIRED = "Members are required";
export const GROUP_MEMBERS_INVALID = "Members must be valid ObjectIds";
export const GROUP_MEMBERS_MIN_LENGTH = "At least one member is required";
