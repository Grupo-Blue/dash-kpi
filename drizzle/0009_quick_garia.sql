CREATE TABLE `mauticEmails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mauticId` int NOT NULL,
	`name` varchar(255),
	`subject` text,
	`category` varchar(100),
	`language` varchar(10),
	`isPublished` boolean DEFAULT true,
	`publishUp` timestamp,
	`publishDown` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mauticEmails_id` PRIMARY KEY(`id`),
	CONSTRAINT `mauticEmails_mauticId_unique` UNIQUE(`mauticId`)
);
--> statement-breakpoint
CREATE TABLE `mauticPages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mauticId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`alias` varchar(255),
	`url` text,
	`category` varchar(100),
	`language` varchar(10),
	`isPublished` boolean DEFAULT true,
	`publishUp` timestamp,
	`publishDown` timestamp,
	`hits` int DEFAULT 0,
	`uniqueHits` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mauticPages_id` PRIMARY KEY(`id`),
	CONSTRAINT `mauticPages_mauticId_unique` UNIQUE(`mauticId`)
);
