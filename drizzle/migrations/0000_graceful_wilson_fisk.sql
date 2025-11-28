CREATE TABLE `apiStatus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`apiName` varchar(100) NOT NULL,
	`companyId` int,
	`status` enum('online','offline') NOT NULL,
	`endpoint` varchar(255),
	`errorMessage` text,
	`responseTime` int,
	`lastChecked` timestamp NOT NULL DEFAULT (now()),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `apiStatus_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `discordMetricsSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guildId` varchar(100) NOT NULL,
	`totalMembers` int NOT NULL DEFAULT 0,
	`onlineMembers` int NOT NULL DEFAULT 0,
	`newMembers7days` int NOT NULL DEFAULT 0,
	`newMembers30days` int NOT NULL DEFAULT 0,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `discordMetricsSnapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`serviceName` varchar(100) NOT NULL,
	`apiKey` text,
	`config` json,
	`lastSync` timestamp,
	`lastTested` timestamp,
	`testStatus` varchar(50),
	`testMessage` text,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kpiCache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`integrationId` int,
	`kpiType` varchar(100) NOT NULL,
	`data` json NOT NULL,
	`periodStart` timestamp,
	`periodEnd` timestamp,
	`cachedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kpiCache_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kpiDefinitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`source` varchar(100),
	`category` varchar(100),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kpiDefinitions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kpiSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int,
	`snapshotDate` timestamp NOT NULL,
	`kpiType` varchar(100) NOT NULL,
	`source` varchar(100) NOT NULL,
	`data` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kpiSnapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leadJourneyCache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`mauticData` json,
	`pipedriveData` json,
	`aiAnalysis` text,
	`cachedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `leadJourneyCache_id` PRIMARY KEY(`id`),
	CONSTRAINT `leadJourneyCache_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `leadJourneySearches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`leadName` varchar(255),
	`mauticId` int,
	`pipedrivePersonId` int,
	`pipedriveDealId` int,
	`conversionStatus` enum('lead','negotiating','won','lost') NOT NULL DEFAULT 'lead',
	`dealValue` int,
	`daysInBase` int,
	`daysToConversion` int,
	`searchedAt` timestamp NOT NULL DEFAULT (now()),
	`searchedBy` int NOT NULL,
	CONSTRAINT `leadJourneySearches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socialMediaMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`network` varchar(50) NOT NULL,
	`recordDate` timestamp NOT NULL,
	`followers` int NOT NULL DEFAULT 0,
	`posts` int NOT NULL DEFAULT 0,
	`totalLikes` int NOT NULL DEFAULT 0,
	`totalComments` int NOT NULL DEFAULT 0,
	`totalShares` int NOT NULL DEFAULT 0,
	`totalViews` int NOT NULL DEFAULT 0,
	`totalReach` int NOT NULL DEFAULT 0,
	`totalImpressions` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `socialMediaMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tiktokMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`recordDate` timestamp NOT NULL,
	`followers` int NOT NULL DEFAULT 0,
	`videos` int NOT NULL DEFAULT 0,
	`totalViews` int NOT NULL DEFAULT 0,
	`totalLikes` int NOT NULL DEFAULT 0,
	`totalComments` int NOT NULL DEFAULT 0,
	`totalShares` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tiktokMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64),
	`name` text,
	`email` varchar(320),
	`password` varchar(255),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
