CREATE TABLE `books` (
	`id` text PRIMARY KEY DEFAULT 'uuid_generate_v4()' NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`synopsis` text NOT NULL,
	`cover_url` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY DEFAULT 'uuid_generate_v4()' NOT NULL,
	`list_id` text NOT NULL,
	`commenter_name` text NOT NULL,
	`text` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `list_books` (
	`id` text PRIMARY KEY DEFAULT 'uuid_generate_v4()' NOT NULL,
	`list_id` text NOT NULL,
	`book_id` text NOT NULL,
	`added_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lists` (
	`id` text PRIMARY KEY DEFAULT 'uuid_generate_v4()' NOT NULL,
	`user_id` text NOT NULL,
	`slug` text DEFAULT (lower(hex(randomblob(8)))),
	`title` text NOT NULL,
	`description` text NOT NULL,
	`is_public` integer NOT NULL,
	`comments_enabled` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY DEFAULT 'uuid_generate_v4()' NOT NULL,
	`clerk_user_id` text NOT NULL,
	`name` text NOT NULL,
	`avatar_url` text,
	`bio` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);