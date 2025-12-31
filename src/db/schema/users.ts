import { boolean, index, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email').notNull(),
    password: varchar('password').notNull(),
    fname: varchar('fname').notNull(),
    lname: varchar('lname').notNull(),
    mname: varchar('mname'),

    phone_number: varchar('phone_number'),
    role: varchar('role').notNull().default('user'),
    active: boolean('active').default(true),
    profile_pic: varchar('profile_pic'),
    designation: varchar('designation'),
    deleted_at: timestamp('deleted_at'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow()
}, (t) => ({
    usersEmailIdx: index("users_email_idx").on(t.email),
    usersCreatedAtIdx: index("users_created_at_idx").on(t.created_at),
    usersFnameIdx: index("users_fname_idx").on(t.fname)
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UsersTable = typeof users;
