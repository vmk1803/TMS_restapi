import { index, integer, pgTable, serial, timestamp, unique } from "drizzle-orm/pg-core";
import { tags } from "./tags";
import { tasks } from "./tasks";
import { relations } from "drizzle-orm";

export const taskTags = pgTable('tasks_tags', {
  id: serial('id').primaryKey(),
  task_id: integer('task_id').references(() => tasks.id).notNull(),
  tag_id: integer('tag_id').references(() => tags.id).notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
}, (t) => ({
  taskIdIdx: index("task_id_idx").on(t.task_id),
  tagIdIdx: index("tag_id_idx").on(t.tag_id),
  taskTagsUnqIdx: unique().on(t.task_id, t.tag_id),
}));

export type ProjectTaskTag = typeof taskTags.$inferSelect;
export type NewProjectTaskTag = typeof taskTags.$inferInsert;
export type ProjectTaskTagTable = typeof taskTags;



export const taskTagsRelations = relations(taskTags, ({ one }) => ({
  task: one(tasks, {
    fields: [taskTags.task_id],
    references: [tasks.id],
  }),
  tag: one(tags, {
    fields: [taskTags.tag_id],
    references: [tags.id],
  }),
}));

