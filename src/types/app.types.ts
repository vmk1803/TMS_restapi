import { Project } from "../db/schema/projects";
import { User } from "../db/schema/users";
import { TaskAssignee } from "../db/schema/taskAssignees";

import { ValidatedForgotPassword } from "../validations/schema/vForgotPasswordSchema";
import { ValidatedLogin } from "../validations/schema/vLoginSchema";
import { ValidatedPasswordChange, ValidatedUpdateUserProfilePic, ValidatedUpdateUserStatus, ValidatedAddUser, ValidatedUpdateUser } from "../validations/schema/vUserSchema";
import { ValidatedLocation, ValidatedUpdateLocation, ValidatedDeleteLocation } from "../validations/schema/vLocationSchema";
import { ValidatedGroup, ValidatedUpdateGroup } from "../validations/schema/vGroupSchema";

import { DBTableRow } from "./db.types";


export type UserDetails = Omit<User, 'password'>;
export type PaginationInfo = {
  total_records: number;
  total_pages: number;
  page_size: number;
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
};

export type PaginatedResp<T extends DBTableRow> = {
  pagination_info: PaginationInfo,
  records: T[];
};

export interface ProjectMember {
  id: number;
  fname: string;
  lname: string;
  email: string;
  phone_number: string | null;
  user_profile_pic: string | null;
}
export type ProjectMembers = {
  records: ProjectMember[];
};

export type LoginRespData = {
  access_token: string;
  refresh_token: string;
  refresh_token_expires_at: number;
  user_details: UserDetails;
};

export interface MonthlyUserData {
  month: string;
  users: number;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalGroups: number;
  totalDepartments: number;
  monthlyData?: MonthlyUserData[];
}

export interface RecentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleName?: string;
  departmentName?: string;
  organizationName?: string;
  createdAt: Date;
}

export interface RoleBreakdown {
  roleId: string;
  roleName: string;
  userCount: number;
  percentage: number;
}

export interface OrganizationOverview {
  organizationId: string;
  organizationName: string;
  userCount: number;
}

export interface ChangeMetrics {
  totalUsersChange: number;
  activeUsersChange: number;
  inactiveUsersChange: number;
  totalGroupsChange: number;
  totalDepartmentsChange: number;
}

export interface EnhancedUserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalGroups: number;
  totalDepartments: number;
  recentlyAddedUsers: RecentUser[];
  changeMetrics?: ChangeMetrics;
}

export interface UserTrendsResponse {
  monthlyData: MonthlyUserData[];
  availableRoles: Array<{ id: string; name: string }>;
  year: number;
  roleId?: string;
}

export interface DepartmentUserCount {
  departmentId: string;
  departmentName: string;
  organizationName: string;
  userCount: number;
}

export interface UsersByDepartmentResponse {
  departments: DepartmentUserCount[];
  totalUsers: number;
}

export type GetTaskAssignneesRespData = {
  task_assignee_id: number;
  user_id: number;
  fname: string;
  lname: string;
  mname: string | null;
  user_type: string;
};

export type uniqueMembersInProject = {
  user_id: number;
  role: "MANAGER" | "ADMIN" | "USER" | "MAINTAINER" | "MEMBER";
}[];

export type TokenRespData = Omit<LoginRespData, 'user_details'>;

export type TaskStats = {
  todo_count: number;
  inProgress_count: number;
  completed_count: number;
  overDue_count: number;
  total_tasks: number;
};

export type AddProjectMembersRespData = {
  id: number;
  created_at: Date | null;
  updated_at: Date | null;
  project_id: number;
  user_id: number;
  role: "SUPER_ADMIN" | "MANAGER" | "ADMIN" | "USER" | "MAINTAINER";
}[];

export type UpdateProjectMembersRespData = {
  user_id: number;
  role: "MANAGER" | "ADMIN" | "USER" | "MAINTAINER";
}[];

export type Projects = Project[];

export type TaskAssigneeData = Omit<TaskAssignee, 'id'>[];

export type CreateTaskAssigneeRespData = {
  user_id: number;
}[];

export type ListTaskAttachmentsRespData = {
  id: number;
  task_id: number;
  file_name: string;
  key: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: number;
  uploaded_at: Date | null;
}[];

export type taskStatsRespData = {
  todo_count: number;
  inprogress_count: number;
  completed_count: number;
  overdue_count: number;
  total_tasks: number;
};

export type CountProjectsRespData = {
  total: number;
};

export type TaskTrendRespData = {
  inprogress_count: number;
  completed_count: number;
  task_date: string | undefined;
}[];

export type ProjectWithTaskStatsRespData = {
  project_id: number;
  project_title: string;
  project_logo: string | null;
  task_todo_count: number;
  task_inprogress_count: number;
  task_completed_count: number;
  task_overdue_count: number;
  total_tasks_count: number;
}[];

export type ProjectIdWithTaskStatsRespData = {
  task_todo_count: number;
  task_inprogress_count: number;
  task_completed_count: number;
  task_overdue_count: number;
  total_tasks_count: number;
};
export type ProjectAssigneeData = {
  project_id: number;
  id: number;
  user_id: number | null;
  user_first_name: string | null;
  user_last_name: string | null;
  user_role: "SUPER_ADMIN" | "MANAGER" | "ADMIN" | "USER" | "MAINTAINER";
  user_profile_pic: string | null;
};

export type ProjectListRespData = {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  code: string;
  active: boolean | null;
  logo: string | null;
  created_by_profile_pic: string | null;
  created_by: number;
  updated_by: number | null;
  created_at: Date | null;
  updated_at: Date | null,
  deleted_at: Date | null;
  assignees: ProjectAssigneeData[];
};

export type AssigneeInFetchTasks = {
  id: number;
  task_id: number;
  user_id: number;
  user_first_name: string | null;
  user_last_name: string | null;
  user_profile_pic: string | null;
  user_profile_pic_url?: string;
};


export type ProjectDetails = {
  project_title: string;
  project_logo: string | null;
};

export type ListTaskDataInService = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: Date | null;
  project_id: number;
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  assignees: AssigneeInFetchTasks[];
};


export type TaskAttachmentWithUrl = {
  id: number;
  task_id: number;
  file_name: string;
  key: string | null;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: number;
  uploaded_at: string;
  download_url: string;
};[];

export type ProjectMembersRecordsType = {
  records: {
    id: number;
    user_id: number;
    role: "SUPER_ADMIN" | "MANAGER" | "ADMIN" | "USER" | "MAINTAINER";
    fname: string;
    lname: string;
    email: string;
    phone_number: string | null;
    user_profile_pic: string | null;
  }[];
};

export type AddProjectGroupRespData = {
  project_user_groups: {
    role: "MANAGER" | "MEMBER";
    group_id: number;
  }[];
  updated_at?: Date | null | undefined;
}

export type AddTaskGroupRespData = {
  task_id: number,
  group_id: number
}[]

export type AppRespData = LoginRespData
  | Partial<UserDetails>
  | TokenRespData
  | PaginatedResp<DBTableRow>
  | FileUploadURLResp
  | ProjectMembers
  | TaskStats
  | UserDetails[]
  | GetTaskAssignneesRespData[]
  | AddProjectMembersRespData
  | UpdateProjectMembersRespData
  | Projects
  | TaskAssigneeData
  | CreateTaskAssigneeRespData
  | ListTaskAttachmentsRespData
  | TaskTagData
  | ProjectTask[]
  | TaskTagResponse
  | TaskStatus
  | CountProjectsRespData
  | TaskTrendRespData
  | ProjectWithTaskStatsRespData
  | taskStatsRespData
  | UserTaskStatusCountResponse
  | TaskStatsCount
  | ProjectIdWithTaskStatsRespData
  | TaskAttachmentWithUrl
  | TaskAddTagRequest
  | LogEntry
  | ProjectMembersRecordsType
  | AddProjectGroupRespData;

export type SuccessResp = {
  status: number;
  success: true;
  message: string;
  data?: AppRespData;
};

export type ErrorResp = {
  status: number;
  success: false;
  message: string;
  errData?: any;
};


export type JWTUserPayload = {
  sub: number;
  iat: number;
};

export type users = {
  id: number;
  name: string;
};

export type tags = {
  title: string;
  id: number;

};

export type TaskTagAssociation = {
  task_id: number;
  tag_id: number;
};

export type TaskLIst = {
  id: number;
  title: string;
  description: string | null;
  created_by: number;
  updated_by: number | null;
  ref_id: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "OVER_DUE";
  completed_at: Date | null;
  project_id: number;
};



export type UploadURLResp = {
  target_url: string,
  file_key: string;
};

export type DownloadURLResp = {
  download_url: string;
};

export type TaskTagData = {
  id: number;
  tag_id: number;
  title: string;
}[];
export type Assignee = {
  user_id: number | null;
  user_first_name: string | null;
  user_last_name: string | null;
  user_profile_pic: string | null;

};

export type ProjectTask = {
  id: number | null;
  title: string | null;
  description: string | null;
  created_at: Date | null;
  task_id: number | null;
  task_title: string | null;
  task_description: string | null;
  task_status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "OVER_DUE";
  assignees: Assignee[];
};

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "OVER_DUE";

export type UserGroup = {
  id: number;
  name: string;
  created_at: Date | null;
  updated_at: Date | null;
  description: string | null;
  created_by: number;
  deleted_at: Date | null;
  title: string;
  updated_by: number | null;
  project_id: number;
}

export type TaskTagResponse = {
  id: number;
  task_id: number;
  tag_id: number;
  tag_name: string | null;
};

export type AssigneeIds = {
  assignees_user_id: number;
  assignees_task_id: number;
};

export type UserTaskFields = {
  id: number | null;
  fname: string | null;
  lname: string | null;
  designation: string | null;
  user_type: string | null;
  profile_pic: string | null;
  email: string | null;
  phone_number: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  active: boolean | null;
  todo_count: number;
  in_progress_count: number;
  overdue_count: number;
  completed_count: number;
};


export type UserTaskStatusCountResponse = {
  pagination_info: PaginationInfo;
  records: UserTaskFields[];
};

export type TaskStatsCount = {
  [key: string]: any;
  status?: string;
  deleted_at?: string | null;
};

export type TaskListWithProfilePics = {
  assignees: { task_id: number; id: number; user_id: number | null; user_first_name: string | null; user_last_name: string | null; user_profile_pic: string | null; }[];
  task_id: number;
  id: number;
  user_id: number | null;
  user_first_name: string | null;
  user_last_name: string | null;
  user_profile_pic: string | null;
  title: string;
  description: string | null;
  created_by: number;
  updated_by: number | null;
  ref_id: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "OVER_DUE";
  completed_at: Date | null;
  project_id: number;
  user_profile_pic_url: string | null;
};

export type TaskAddTagRequest = {
  tags: string[];
};

export type LogEntry = {
  task_id: number;
  description: string;
  action_type: string;
  action_by: number;
  time: Date;
};

export type OverDueEmailData = {
  task: {
    ref_id: string;
    title: string;
    due_date: string;
  };
  assignees: {
    fname: string;
    lname: string;
  }[];
  view_task_link: string;
};


export type FileUploadURLResp = UploadURLResp | DownloadURLResp;

export type roles = 'SUPER_ADMIN' | 'MANAGER' | 'ADMIN' | 'USER' | 'MAINTAINER' | 'MEMBER';

export type ProjectActivity = "projects:create-project" | "projects:create-project-users" | "projects:update-project-users" | "project:update-project" | "project:update-project-logo" | "projects:remove-project-member" | "project:add-project-user-group" | "project:remove-users-from-project-group";

export type UserActivity = 'user:create-admin-user' | 'user:create-regular-user' | 'user:update-user' | 'user:view-user' | 'user:view-all-users' | 'user:update-user-status' | 'user:update-user-profile-pic' | 'user:delete-user' | 'user:reset-password-by-admin' | 'user:create-user-group' | 'user:add-users-to-group' | 'user:update-user-group' | 'user:add-user' | 'user:remove-users-from-group' | 'user:update-users-in-group';

export type PasswordActivity = 'password:update' | 'password:reset' | 'password:reset-by-admin';

export type LoginActivity = 'login' | 'forgot-password';


export type TaskActivity = 'task:update-task' | 'taskassignees:add-taskassignee' | 'taskattachments:upload-task-attachments' | "task:create-task" | "task:add-comment" | "tag:create-tag" | "task:assign-user" | "task:update-comment" | "task:priority-field" | "Task:add-tag" | "task:add-task-user-group" | "task:remove-users-from-task-group";
export type FileActivity = 'file:upload-file' | 'file:download-file';

export type LocationActivity = 'location:create' | 'location:update' | 'location:delete' | 'location:view' | 'location:view-all';

export type GroupActivity = 'group:create' | 'group:update' | 'group:delete' | 'group:view' | 'group:view-all';

export type AppActivity = PasswordActivity | LoginActivity | ProjectActivity | UserActivity | TaskActivity | FileActivity | LocationActivity | GroupActivity;

export type ValidatedRequest = ValidatedLogin | ValidatedForgotPassword | ValidatedPasswordChange | ValidatedUpdateUserStatus
  | ValidatedUpdateUserProfilePic | ValidatedAddUser | ValidatedUpdateUser | ValidatedLocation | ValidatedUpdateLocation | ValidatedDeleteLocation | ValidatedGroup | ValidatedUpdateGroup;
