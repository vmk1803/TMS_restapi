import { index, integer, pgTable, serial, timestamp, unique } from "drizzle-orm/pg-core";
import { tasks } from "./tasks";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const taskAssignees = pgTable('task_assignees', {
  id: serial('id').primaryKey(),
  task_id: integer('task_id').references(() => tasks.id).notNull(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  assigned_at: timestamp('assigned_at').defaultNow()
}, (t) => ({
  taskAssigneeTaskIdx: index("task_assignee_task_idx").on(t.task_id),
  taskAssigneeUserIdx: index("task_assignee_user_idx").on(t.user_id),
  taskAssigneeUnqIdx: unique().on(t.user_id, t.task_id),
}));

export type TaskAssignee = typeof taskAssignees.$inferSelect;
export type NewTaskAssignee = typeof taskAssignees.$inferInsert;
export type TaskAssigneeTable = typeof taskAssignees;


//Every task_assignee record is linked to exactly one task and one user
export const taskAssigneesRealtions = relations(taskAssignees, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAssignees.task_id],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskAssignees.user_id],
    references: [users.id],
  }),
}));

