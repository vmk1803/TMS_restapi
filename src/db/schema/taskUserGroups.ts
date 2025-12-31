import { index, integer, pgTable, serial, timestamp, unique } from "drizzle-orm/pg-core";
import { userGroups } from "./userGroups";
import { tasks } from "./tasks";

export const taskUserGroups = pgTable('task_user_groups', {
    id: serial('id').primaryKey(),
    task_id: integer('task_id').references(() => tasks.id).notNull(),
    group_id: integer('group_id').references(() => userGroups.id).notNull(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow()
}, (t) => ({
    taskGroupProjectIdx: index("task_user_groups_project_idx").on(t.task_id),
    taskgroupIdx: index("task_group_idx").on(t.group_id),
    taskGroupUnqIdx: unique().on(t.group_id, t.task_id),
}));

export type TaskUserGroup = typeof taskUserGroups.$inferSelect;
export type NewTaskUserGroup = typeof taskUserGroups.$inferInsert;
export type TaskUserGroupTable = typeof taskUserGroups;
