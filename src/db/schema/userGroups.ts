import { pgTable, serial, integer, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userGroups = pgTable(
  "user_groups",
  {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull().unique(),
    description: varchar("description"),
    created_by: integer("created_by").references(() => users.id),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
    deleted_at: timestamp("deleted_at"),
  },
  (t) => ({
    userGroupsNameIdx: index("user_groups_name_idx").on(t.name),
    userGroupsCreatedByIdx: index("user_groups_created_by_idx").on(t.created_by),
  })
);

export type UserGroup = typeof userGroups.$inferSelect;
export type NewUserGroup = typeof userGroups.$inferInsert;
export type UserGroupTable = typeof userGroups;
