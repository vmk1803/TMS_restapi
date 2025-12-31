import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from "pg";

import * as TaskSchema from '../db/schema/tasks';
import * as ProjectSchema from '../db/schema/projects';
import * as UserSchema from '../db/schema/users';
import * as TagSchema from '../db/schema/tags';
import * as TaskAssigneeSchema from '../db/schema/taskAssignees';
import * as TaskTagsSchema from '../db/schema/taskTags';

const pool = new Pool({
  connectionString: process.env.DB_URL!
});

export const db = drizzle(pool, {
  schema: {
    ...TaskSchema,
    ...ProjectSchema,
    ...UserSchema,
    ...TagSchema,
    ...TaskAssigneeSchema,
    ...TaskTagsSchema
  }
});