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
