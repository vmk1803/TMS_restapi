DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('SUPER_ADMIN', 'MANAGER', 'ADMIN', 'USER', 'MAINTAINER', 'MEMBER', 'LEAD');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."priority" AS ENUM('LOW', 'MEDIUM', 'HIGH');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."project_status" AS ENUM('COMPLETED', 'IN_PROGRESS', 'OVER_DUE', 'TODO');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "map_user_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"group_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"task_id" integer,
	"project_id" integer,
	"message" text NOT NULL,
	"category" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"is_marked" boolean DEFAULT false,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"slug" varchar NOT NULL,
	"code" varchar NOT NULL,
	"active" boolean DEFAULT true,
	"logo" varchar,
	"timezone" varchar,
	"created_by" integer NOT NULL,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug"),
	CONSTRAINT "projects_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_user_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"group_id" integer NOT NULL,
	"role" "role" DEFAULT 'MEMBER',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "project_user_groups_group_id_project_id_unique" UNIQUE("group_id","project_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" "role" DEFAULT 'MEMBER' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "project_users_user_id_project_id_unique" UNIQUE("user_id","project_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_at" bigint NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reset_password_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "reset_password_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sub_task_refs" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_task" integer NOT NULL,
	"sub_task" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"description" varchar NOT NULL,
	"action_type" varchar NOT NULL,
	"action_by" integer,
	"time" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task_assignees" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	CONSTRAINT "task_assignees_user_id_task_id_unique" UNIQUE("user_id","task_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"file_name" varchar NOT NULL,
	"key" varchar NOT NULL,
	"file_type" varchar,
	"file_size" integer,
	"uploaded_by" integer NOT NULL,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"task_id" integer NOT NULL,
	"commented_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"reply_to" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"ref_id" varchar NOT NULL,
	"description" text,
	"status" "project_status" DEFAULT 'TODO' NOT NULL,
	"priority" "priority" DEFAULT 'LOW',
	"due_date" timestamp NOT NULL,
	"project_id" integer NOT NULL,
	"created_by" integer NOT NULL,
	"updated_by" integer,
	"is_sub_task" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"completed_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "tasks_ref_id_unique" UNIQUE("ref_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "tasks_tags_task_id_tag_id_unique" UNIQUE("task_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task_user_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"group_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "task_user_groups_group_id_task_id_unique" UNIQUE("group_id","task_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"fname" varchar NOT NULL,
	"lname" varchar NOT NULL,
	"mname" varchar,
	"phone_number" varchar,
	"user_type" varchar DEFAULT 'user' NOT NULL,
	"active" boolean DEFAULT true,
	"profile_pic" varchar,
	"designation" varchar,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "map_user_groups" ADD CONSTRAINT "map_user_groups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "map_user_groups" ADD CONSTRAINT "map_user_groups_group_id_user_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."user_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_user_groups" ADD CONSTRAINT "project_user_groups_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_user_groups" ADD CONSTRAINT "project_user_groups_group_id_user_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."user_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_users" ADD CONSTRAINT "project_users_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_users" ADD CONSTRAINT "project_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reset_password_tokens" ADD CONSTRAINT "reset_password_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sub_task_refs" ADD CONSTRAINT "sub_task_refs_parent_task_tasks_id_fk" FOREIGN KEY ("parent_task") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sub_task_refs" ADD CONSTRAINT "sub_task_refs_sub_task_tasks_id_fk" FOREIGN KEY ("sub_task") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_activities" ADD CONSTRAINT "task_activities_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_activities" ADD CONSTRAINT "task_activities_action_by_users_id_fk" FOREIGN KEY ("action_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_commented_by_users_id_fk" FOREIGN KEY ("commented_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks_tags" ADD CONSTRAINT "tasks_tags_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks_tags" ADD CONSTRAINT "tasks_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_user_groups" ADD CONSTRAINT "task_user_groups_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_user_groups" ADD CONSTRAINT "task_user_groups_group_id_user_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."user_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "map_user_group_idx" ON "map_user_groups" USING btree ("user_id","group_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_category_idx" ON "notifications" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_updated_at_idx" ON "notifications" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_title_idx" ON "projects" USING btree ("title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_slug_idx" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_code_idx" ON "projects" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_created_at_idx" ON "projects" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_deleted_at_idx" ON "projects" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_active_idx" ON "projects" USING btree ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_timezone_idx" ON "projects" USING btree ("timezone");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_user_groups_project_idx" ON "project_user_groups" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_idx" ON "project_user_groups" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_idx" ON "project_users" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_idx" ON "project_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refresh_tokens_user_id_idx" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refresh_tokens_refresh_token_idx" ON "refresh_tokens" USING btree ("refresh_token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "forgot_password_tokens_token_idx" ON "reset_password_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sub_tasks_parent_task_idx" ON "sub_task_refs" USING btree ("parent_task");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sub_task_idx" ON "sub_task_refs" USING btree ("sub_task");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tag_title_idx" ON "tags" USING btree ("title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_activities_task_idx" ON "task_activities" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_activities_action_by_idx" ON "task_activities" USING btree ("action_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_activities_time_idx" ON "task_activities" USING btree ("action_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_assignee_task_idx" ON "task_assignees" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_assignee_user_idx" ON "task_assignees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_attachments_task_idx" ON "task_attachments" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_attachments_uploaded_at_idx" ON "task_attachments" USING btree ("uploaded_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_idx" ON "task_comments" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comment_by_idx" ON "task_comments" USING btree ("commented_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_project_idx" ON "tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_title_idx" ON "tasks" USING btree ("title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_created_at_idx" ON "tasks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_completed_at_idx" ON "tasks" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_deleted_at_idx" ON "tasks" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_is_sub_task_idx" ON "tasks" USING btree ("is_sub_task");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_id_idx" ON "tasks_tags" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tag_id_idx" ON "tasks_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_user_groups_project_idx" ON "task_user_groups" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_group_idx" ON "task_user_groups" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_groups_name_idx" ON "user_groups" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_groups_created_by_idx" ON "user_groups" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_fname_idx" ON "users" USING btree ("fname");