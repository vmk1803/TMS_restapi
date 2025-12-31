import { index, integer, pgEnum, pgTable, serial, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";
import { relations } from "drizzle-orm/relations";
import { tasks } from "./tasks";

export const projects = pgTable('projects', {
    id: serial('id').primaryKey(),
    title: varchar('title').notNull(),
    description: text('description'),
    slug: varchar('slug').notNull().unique(),
    code: varchar('code').notNull().unique(),
    active: boolean('active').default(true),
    logo: varchar('logo'),
    timezone: varchar('timezone'),
    created_by: integer('created_by').references(() => users.id).notNull(),
    updated_by: integer('updated_by').references(() => users.id),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at'),
    deleted_at: timestamp('deleted_at')
}, (t) => ({
    projectsTitleIdx: index("projects_title_idx").on(t.title),
    projectsSlugIdx: index("projects_slug_idx").on(t.slug),
    projectsCodeIdx: index("projects_code_idx").on(t.code),
    projectsCreatedAtIdx: index("projects_created_at_idx").on(t.created_at),
    projectsDeleteAtIdx: index("projects_deleted_at_idx").on(t.deleted_at),
    projectsActiveIdx: index("projects_active_idx").on(t.active),
    projectsTimezoneIdx: index("projects_timezone_idx").on(t.timezone),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectsTable = typeof projects;


export const ProjectTaskRelation = relations(projects, ({ many }) => ({
    tasks: many(tasks)
}));

export const ProjectUserRelation = relations(projects, ({ one }) => ({
    created_by: one(users, {
        fields: [projects.created_by],
        references: [users.id],
    }),
    updated_by: one(users, {
        fields: [projects.updated_by],
        references: [users.id],
    }),
}));