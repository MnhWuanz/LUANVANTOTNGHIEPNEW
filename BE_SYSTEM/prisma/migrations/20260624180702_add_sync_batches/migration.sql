-- CreateTable
CREATE TABLE `sync_batches` (
    `id_sync_batch` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('PROCESSING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PROCESSING',
    `total_records` INTEGER NOT NULL DEFAULT 0,
    `success_records` INTEGER NOT NULL DEFAULT 0,
    `failed_records` INTEGER NOT NULL DEFAULT 0,
    `summary` JSON NULL,
    `error_message` TEXT NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finished_at` DATETIME(3) NULL,

    PRIMARY KEY (`id_sync_batch`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
