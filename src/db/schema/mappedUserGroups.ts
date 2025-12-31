import { pgTable, serial, integer, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { userGroups } from "./userGroups";

export const mapUserGroups = pgTable(
  "map_user_groups",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").references(() => users.id).notNull(),
    group_id: integer("group_id").references(() => userGroups.id).notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
    deleted_at: timestamp('deleted_at'),

  },
  (t) => ({
    mapUserGroupIdx: index("map_user_group_idx").on(t.user_id, t.group_id),
  })
);

export type MapUserGroup = typeof mapUserGroups.$inferSelect;
export type NewMapUserGroup = typeof mapUserGroups.$inferInsert;
export type MapUserGroupTable = typeof mapUserGroups;
