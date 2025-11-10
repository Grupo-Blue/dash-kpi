CREATE TABLE `apiStatus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`apiName` varchar(100) NOT NULL,
	`companyId` int,
	`status` enum('success','failure') NOT NULL,
	`endpoint` varchar(255),
	`errorMessage` text,
	`responseTime` int,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `apiStatus_id` PRIMARY KEY(`id`)
);
