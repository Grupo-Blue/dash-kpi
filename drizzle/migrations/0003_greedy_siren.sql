-- Sprint I4: Add companyId to integrations table
-- This migration adds company-level isolation to integrations

-- Step 1: Remove unique constraint on serviceName
ALTER TABLE `integrations` DROP INDEX `integrations_serviceName_unique`;

-- Step 2: Add companyId column (nullable first to avoid breaking existing data)
ALTER TABLE `integrations` ADD `companyId` int NULL;

-- Step 3: Set default companyId to 1 (Blue Consult) for existing integrations
UPDATE `integrations` SET `companyId` = 1 WHERE `companyId` IS NULL;

-- Step 4: Make companyId NOT NULL now that all rows have a value
ALTER TABLE `integrations` MODIFY `companyId` int NOT NULL;

-- Step 5: Add unique constraint on (companyId, serviceName)
ALTER TABLE `integrations` ADD CONSTRAINT `company_service_unique` UNIQUE(`companyId`,`serviceName`);
