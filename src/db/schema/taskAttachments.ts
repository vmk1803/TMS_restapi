import { index, integer, pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";
import { tasks } from "./tasks";
import { users } from "./users";

export const taskAttachments = pgTable('task_attachments', {
  id: serial('id').primaryKey(),
  task_id: integer('task_id').references(() => tasks.id).notNull(),
  file_name: varchar('file_name').notNull(),
  key: varchar('key').notNull(),
  file_type: varchar('file_type'),
  file_size: integer('file_size'),

  uploaded_by: integer('uploaded_by').references(() => users.id).notNull(),
  uploaded_at: timestamp('uploaded_at').defaultNow()

}, (t) => ({
  taskAttachmentsTaskIdx: index("task_attachments_task_idx").on(t.task_id),
  taskAttachmentsUploadedAtIdx: index("task_attachments_uploaded_at_idx").on(t.uploaded_at),
}));

export type TaskAttachment = typeof taskAttachments.$inferSelect;
export type NewTaskAttachment = typeof taskAttachments.$inferInsert;
export type TaskAttachmentsTable = typeof taskAttachments; 