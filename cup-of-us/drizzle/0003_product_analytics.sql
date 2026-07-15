CREATE TABLE IF NOT EXISTS `analytics_events` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,`session_id` text NOT NULL,`event_name` text NOT NULL,`book_slug` text,`source` text,`metadata` text DEFAULT '{}' NOT NULL,`created_at` integer NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `analytics_event_name_idx` ON `analytics_events` (`event_name`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `analytics_book_slug_idx` ON `analytics_events` (`book_slug`);
