import { index, integer, pgEnum, pgTable, serial, timestamp, unique } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { users } from "./users";

export const rolesEnum = pgEnum('role', ['SUPER_ADMIN', 'MANAGER', 'ADMIN', 'USER', 'MAINTAINER', 'MEMBER', 'LEAD',]);

export const projectUsers = pgTable('project_users', {
    id: serial('id').primaryKey(),
    project_id: integer('project_id').references(() => projects.id).notNull(),
    user_id: integer('user_id').references(() => users.id).notNull(),
    role: rolesEnum('role').default('MEMBER').notNull(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow()
}, (t) => ({
    projectIdx: index("projects_idx").on(t.project_id),
    userIdx: index("users_idx").on(t.user_id),
    projectUserUnqIdx: unique().on(t.user_id, t.project_id),
}));

export type ProjectUser = typeof projectUsers.$inferSelect;
export type NewProjectUser = typeof projectUsers.$inferInsert;
export type ProjectUserTable = typeof projectUsers;
export type rolesEnum = typeof rolesEnum;