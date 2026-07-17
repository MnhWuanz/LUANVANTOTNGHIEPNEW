-- AlterTable
ALTER TABLE `attendance_records` ADD COLUMN `is_manual_update` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `note` TEXT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NULL;
