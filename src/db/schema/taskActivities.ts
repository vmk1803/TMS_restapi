import { index, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tasks } from "./tasks";
import { users } from "./users";

export const taskActivities = pgTable('task_activities', {
  id: serial('id').primaryKey(),
  task_id: integer('task_id').references(() => tasks.id).notNull(),
  description: varchar('description').notNull(),
  action_type: varchar('action_type').notNull(),
  action_by: integer('action_by').references(() => users.id),
  time: timestamp('time').defaultNow()
}, (t) => ({
  taskActivitiesTaskIdx: index("task_activities_task_idx").on(t.task_id),
  taskActivitiesActionByIdx: index("task_activities_action_by_idx").on(t.action_by),
  taskActivitiesTimeIdx: index("task_activities_time_idx").on(t.action_by),
}));

export type TaskActivity = typeof taskActivities.$inferSelect;
export type NewTaskActivity = typeof taskActivities.$inferInsert;
export type TaskActivitiesTable = typeof taskActivities;
