import { index, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  title: varchar('title').notNull().unique() // lowercase
}, (t) => ({
  tagTitleIndex: index("tag_title_idx").on(t.title),
}));

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type TagsTable = typeof tags;