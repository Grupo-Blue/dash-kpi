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
