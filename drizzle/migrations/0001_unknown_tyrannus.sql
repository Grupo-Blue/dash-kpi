ALTER TABLE `integrations` ADD `credentials` json NOT NULL;--> statement-breakpoint
ALTER TABLE `integrations` ADD `enabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `integrations` ADD CONSTRAINT `integrations_serviceName_unique` UNIQUE(`serviceName`);--> statement-breakpoint
ALTER TABLE `integrations` DROP COLUMN `userId`;--> statement-breakpoint
ALTER TABLE `integrations` DROP COLUMN `apiKey`;--> statement-breakpoint
ALTER TABLE `integrations` DROP COLUMN `active`;