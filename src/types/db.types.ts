// Importing necessary types from the database schema
import { MapUserGroup, MapUserGroupTable, NewMapUserGroup } from "../db/schema/mappedUserGroups";
import { NewNotification, Notification, NotificationTable } from "../db/schema/notifications";
import { NewProject, Project, ProjectsTable } from "../db/schema/projects";
import { NewProjectUserGroup, ProjectUserGroup, ProjectUserGroupTable } from "../db/schema/projectUserGroups";
import { NewProjectUser, ProjectUser, ProjectUserTable } from "../db/schema/projectUsers";
import { NewRefreshToken, RefreshToken, RefreshTokensTable } from "../db/schema/refreshToken";
import { NewResetPasswordToken, ResetPasswordToken, ResetPasswordTokensTable } from "../db/schema/resetPasswordToken";
import { NewSubTaskRef, SubTaskRef, SubTaskRefsTable } from "../db/schema/subTaskRefs";
import { NewTag, Tag, TagsTable } from "../db/schema/tags";
import { NewTaskActivity, TaskActivity, TaskActivitiesTable } from "../db/schema/taskActivities";
import { NewTaskAssignee, TaskAssignee, TaskAssigneeTable } from "../db/schema/taskAssignees";
import { NewTaskAttachment, TaskAttachment, TaskAttachmentsTable } from "../db/schema/taskAttachments";
import { NewTaskComment, TaskComment, TaskCommentsTable } from "../db/schema/taskComments";
import { NewTask, Task, TasksTable } from "../db/schema/tasks";
import { NewProjectTaskTag, ProjectTaskTag, ProjectTaskTagTable } from "../db/schema/taskTags";
import { NewTaskUserGroup, TaskUserGroup, TaskUserGroupTable } from "../db/schema/taskUserGroups";
import { NewUserGroup, UserGroup, UserGroupTable } from "../db/schema/userGroups";
import { NewUser, User, UsersTable } from "../db/schema/users";



export type DBTable =
  | ProjectsTable
  | ProjectUserTable
  | TagsTable
  | TaskActivitiesTable
  | TaskAssigneeTable
  | TaskAttachmentsTable
  | TaskCommentsTable
  | TasksTable
  | ProjectTaskTagTable
  | UsersTable
  | RefreshTokensTable
  | ResetPasswordTokensTable
  | NotificationTable
  | SubTaskRefsTable
  | UserGroupTable
  | MapUserGroupTable
  | ProjectUserGroupTable
  | TaskUserGroupTable;

export type DBTableRow =
  | Project
  | ProjectUser
  | Tag
  | TaskActivity
  | TaskAssignee
  | TaskAttachment
  | TaskComment
  | Task
  | User
  | ProjectTaskTag
  | RefreshToken
  | ResetPasswordToken
  | Notification
  | SubTaskRef
  | UserGroup
  | MapUserGroup
  | ProjectUserGroup
  | TaskUserGroup;

export type DBNewRecord =
  | NewUser
  | NewProjectUser
  | NewTag
  | NewTaskActivity
  | NewTaskAssignee
  | NewTaskAttachment
  | NewTaskComment
  | NewTask
  | NewProject
  | NewProjectTaskTag
  | NewRefreshToken
  | NewResetPasswordToken
  | NewTaskActivity
  | NewNotification
  | NewSubTaskRef
  | NewUserGroup
  | NewMapUserGroup
  | NewProjectUserGroup
  | NewTaskUserGroup;

export type DBNewRecords =
  | NewUser[]
  | NewProjectUser[]
  | NewTag[]
  | NewTaskActivity[]
  | NewTaskAssignee[]
  | NewTaskAttachment[]
  | NewTaskComment[]
  | NewTask[]
  | NewProject[]
  | NewProjectTaskTag[]
  | NewNotification[]
  | NewUserGroup[]
  | NewMapUserGroup[]
  | NewProjectUserGroup[]
  | NewTaskUserGroup[];

export type DBTableColumns<T extends DBTableRow> = keyof T;
export type SortDirection = "asc" | "desc";

export type WhereQueryData<T extends DBTableRow> = {
  columns: Array<keyof T>;
  values: any[];
};

export type OrderByQueryData<T extends DBTableRow> = {
  columns: Array<DBTableColumns<T>>;
  values: SortDirection[];
};

export type InQueryData<T extends DBTableRow> = {
  key: keyof T;
  values: any[];
};

export type MultiColumnInQueryData<T extends DBTableRow> = {
  keys: (keyof T)[];
  values: any[][];
};

export type QueryOptions = {
  columns?: string[];
  values?: ('asc' | 'desc')[];
  limit?: number;
};


export type UpdateRecordData<R extends DBTableRow> = Partial<Omit<R, "id" | "created_at" | "updated_at">>;

export type projectWithUsers = Omit<Project, "active" | "created_at" | "updated_at" | "deleted_at" | "logo" | "created_by" | "updated_by"> & {
  users: Omit<User, "mname" | "profile_pic" | "password" | "user_type" | "active" | "created_at" | "updated_at">[];
};


export type PaginationInfo = {
  total_records: number;
  total_pages: number;
  page_size: number;
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
};

export type PaginatedRecords<T extends DBTableRow> = {
  pagination_info: PaginationInfo;
  records: T[];
};

export type presignedUrls = {
  download_url: string;
};

export type emailOptions = {
  from: string;
  to: string[];
  cc?: string[] | null;
  subject: string;
  html: string;
};

export type TaskQueryParams = {
  limit?: number;
};

export type DBTaskRow = {
  project: string;
  task_name: string;
  assigned_user: string;
  due_date: Date;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "OVER_DUE";
  priority: "HIGH" | "MEDIUM" | "LOW";
};

export type DBTaskPagination = {
  pagination_info: PaginationInfo;
  records: DBTaskRow[];
};

export type UserColumn = "id" | "email" | "password" | "fname" | "lname" | "mname" | "phone_number" | "user_type" | "active" | "profile_pic" | "designation" | "deleted_at" | "created_at" | "updated_at";


export type ValidColumns = 'id' | 'title';


export type OrderByTagQueryData<T extends DBTableRow> = {
  columns: ValidColumns[];
  values: SortDirection[];
};

export type EmailData = {
  task_refid: string;
  project_code: string;
  created_by: string;
  avatar: string;
  due_date: string;
  description: string;
  email_subject: string;
  view_task_link: string;
  time: string;
};

export type NotificationLog = {
  user_id: number;
  task_id: number;
  message: string;
  project_id: number;
  category: number;
};
export type userUpdateNotification = {
  user_id: number;
  task_id: number;
  message: string;
  project_id: number;
  category: number;
  updated_at: Date;
  created_at?: Date;
  is_marked?: boolean;
};

export type GetAttachmentDetails = {
  id: number;
  task_id: number;
  file_name: string;
  key: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: number;
  uploaded_at: Date | null;
};





