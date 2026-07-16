ALTER TABLE `auth_users` ADD `email_verified_at` integer;
--> statement-breakpoint
CREATE TABLE `auth_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`purpose` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_tokens_token_hash_unique` ON `auth_tokens` (`token_hash`);
--> statement-breakpoint
CREATE INDEX `auth_tokens_user_purpose_idx` ON `auth_tokens` (`user_id`,`purpose`);
--> statement-breakpoint
CREATE INDEX `auth_tokens_expires_at_idx` ON `auth_tokens` (`expires_at`);
--> statement-breakpoint
CREATE TABLE `auth_rate_limits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key_hash` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`reset_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_rate_limits_key_hash_unique` ON `auth_rate_limits` (`key_hash`);
--> statement-breakpoint
CREATE INDEX `auth_rate_limits_reset_at_idx` ON `auth_rate_limits` (`reset_at`);
