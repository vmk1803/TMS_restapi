import { index, integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { tasks } from "./tasks";


export const subTaskRefs = pgTable('sub_task_refs', {
  id: serial('id').primaryKey(),
  parent_task: integer('parent_task').references(() => tasks.id).notNull(),
  sub_task: integer('sub_task').references(() => tasks.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
}, (t) => ({
  subTaskRefsParentTaskIdx: index("sub_tasks_parent_task_idx").on(t.parent_task),
  subTaskRefsIdx: index("sub_task_idx").on(t.sub_task),

}));

export type SubTaskRef = typeof subTaskRefs.$inferSelect;
export type NewSubTaskRef = typeof subTaskRefs.$inferInsert;
export type SubTaskRefsTable = typeof subTaskRefs;

