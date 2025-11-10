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
