import { index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { tasks } from "./tasks";
import { users } from "./users";

export const taskComments = pgTable('task_comments', {
  id: serial('id').primaryKey(),

  message: text('message').notNull(),
  task_id: integer('task_id').references(() => tasks.id).notNull(),
  commented_by: integer('commented_by').references(() => users.id).notNull(),

  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  reply_to: integer('reply_to')

}, (t) => ({
  taskIdx: index("tasks_idx").on(t.task_id),
  commentByIdx: index("comment_by_idx").on(t.commented_by)
}));

export type TaskComment = typeof taskComments.$inferSelect;
export type NewTaskComment = typeof taskComments.$inferInsert;
export type TaskCommentsTable = typeof taskComments; 