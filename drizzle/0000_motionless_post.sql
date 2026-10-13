CREATE TABLE `try_catalog` (
	`entity_id` text PRIMARY KEY NOT NULL,
	`item` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `try_catalog_expiry_idx` ON `try_catalog` (`expires_at`);