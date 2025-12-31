import { index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const reset_password_tokens = pgTable('reset_password_tokens', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  token: text('token').unique().notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (t) => ({
  forgotPasswordTokensTokenIdx: index("forgot_password_tokens_token_idx").on(t.token),
}));

export type ResetPasswordToken = typeof reset_password_tokens.$inferSelect;
export type NewResetPasswordToken = typeof reset_password_tokens.$inferInsert;
export type ResetPasswordTokensTable = typeof reset_password_tokens;