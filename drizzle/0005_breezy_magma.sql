ALTER TABLE `apiStatus` MODIFY COLUMN `status` enum('online','offline') NOT NULL;--> statement-breakpoint
ALTER TABLE `apiStatus` ADD `lastChecked` timestamp DEFAULT (now()) NOT NULL;