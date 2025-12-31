import { boolean, index, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { projects } from "./projects";
import { relations } from "drizzle-orm/relations";
import { taskAssignees } from "./taskAssignees";
import { taskTags } from "./taskTags";

export const priorityEnum = pgEnum('priority', ['LOW', 'MEDIUM', 'HIGH']);

export const projectStatusEnum = pgEnum('project_status', ['COMPLETED', 'IN_PROGRESS', 'OVER_DUE', 'TODO']);


export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: varchar('title').notNull(),
  ref_id: varchar('ref_id').notNull().unique(), // "PROJECT_CODE"-"TASK_ID"
  description: text('description'),
  status: projectStatusEnum('status').default('TODO').notNull(),
  priority: priorityEnum('priority').default('LOW'),
  due_date: timestamp('due_date').notNull(),

  project_id: integer('project_id').references(() => projects.id).notNull(),
  created_by: integer('created_by').references(() => users.id).notNull(),

  updated_by: integer('updated_by').references(() => users.id),
  is_sub_task: boolean('is_sub_task').default(false),

  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  completed_at: timestamp('completed_at'),
  deleted_at: timestamp('deleted_at')

}, (t) => ({
  tasksStatusIdx: index("tasks_status_idx").on(t.status),
  tasksProjectIdx: index("tasks_project_idx").on(t.project_id),
  tasksTitleIdx: index("tasks_title_idx").on(t.title),

  taskCreatedAtIdx: index("tasks_created_at_idx").on(t.created_at),
  taskCompletedAtIdx: index("tasks_completed_at_idx").on(t.completed_at),
  taskDeletedAtIdx: index("tasks_deleted_at_idx").on(t.deleted_at),
  taskIsSubTaskIdx: index("tasks_is_sub_task_idx").on(t.is_sub_task),

}));

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type TasksTable = typeof tasks;



export const tasksRelations = relations(tasks, ({ one, many }) => ({
  created_by: one(users, {
    fields: [tasks.created_by],
    references: [users.id],
  }),
  updated_by: one(users, {
    fields: [tasks.updated_by],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [tasks.project_id],
    references: [projects.id],
  }),
  assignees: many(taskAssignees),
  tags: many(taskTags)

}));