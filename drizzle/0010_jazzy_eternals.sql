CREATE TABLE `mauticCampaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mauticId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`isPublished` boolean DEFAULT true,
	`publishUp` timestamp,
	`publishDown` timestamp,
	`createdAt` timestamp,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mauticCampaigns_id` PRIMARY KEY(`id`),
	CONSTRAINT `mauticCampaigns_mauticId_unique` UNIQUE(`mauticId`)
);
--> statement-breakpoint
CREATE TABLE `mauticSegments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mauticId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`alias` varchar(255),
	`description` text,
	`isPublished` boolean DEFAULT true,
	`isGlobal` boolean DEFAULT false,
	`createdAt` timestamp,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mauticSegments_id` PRIMARY KEY(`id`),
	CONSTRAINT `mauticSegments_mauticId_unique` UNIQUE(`mauticId`)
);
--> statement-breakpoint
CREATE TABLE `mauticStages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mauticId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`weight` int DEFAULT 0,
	`isPublished` boolean DEFAULT true,
	`createdAt` timestamp,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mauticStages_id` PRIMARY KEY(`id`),
	CONSTRAINT `mauticStages_mauticId_unique` UNIQUE(`mauticId`)
);
