import { index, integer, pgEnum, pgTable, serial, timestamp, unique } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { userGroups } from "./userGroups";

export const projectGroupRolesEnum = pgEnum('role', [ 'MANAGER','MEMBER',]);

export const projectUserGroups = pgTable('project_user_groups', {
    id: serial('id').primaryKey(),
    project_id: integer('project_id').references(() => projects.id).notNull(),
    group_id: integer('group_id').references(() => userGroups.id).notNull(),
    role: projectGroupRolesEnum('role').default('MEMBER'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow()
}, (t) => ({
    projectGroupProjectIdx: index("project_user_groups_project_idx").on(t.project_id),
    groupIdx: index("group_idx").on(t.group_id),
    projectGroupUnqIdx: unique().on(t.group_id, t.project_id),
}));

export type ProjectUserGroup = typeof projectUserGroups.$inferSelect;
export type NewProjectUserGroup = typeof projectUserGroups.$inferInsert;
export type ProjectUserGroupTable = typeof projectUserGroups;
export type projectGroupRolesEnum = typeof projectGroupRolesEnum;