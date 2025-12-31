import { index, integer, pgTable, serial, timestamp, text, boolean } from "drizzle-orm/pg-core";
import { tasks } from "./tasks";
import { users } from "./users";
import { projects } from "./projects";

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  task_id: integer('task_id').references(() => tasks.id),
  project_id: integer('project_id').references(() => projects.id),
  message: text('message').notNull(),
  category: integer('category').notNull(), // 1 = TASK, 2 = PROJECT,3 = USER
  created_at: timestamp('created_at').defaultNow(),
  is_marked: boolean('is_marked').default(false),
  updated_at: timestamp('updated_at')

}, (t) => ({
  notificationsUserIdIdx: index("notifications_user_id_idx").on(t.user_id),
  notificationsCategoryIdx: index("notifications_category_idx").on(t.category),
  notificationsUpdatedAtIdx: index("notifications_updated_at_idx").on(t.updated_at)
}));

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationTable = typeof notifications;