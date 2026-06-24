/*
  Warnings:

  - You are about to drop the column `error_message` on the `sync_batches` table. All the data in the column will be lost.
  - You are about to drop the column `failed_records` on the `sync_batches` table. All the data in the column will be lost.
  - You are about to drop the column `finished_at` on the `sync_batches` table. All the data in the column will be lost.
  - You are about to drop the column `started_at` on the `sync_batches` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `sync_batches` table. All the data in the column will be lost.
  - You are about to drop the column `success_records` on the `sync_batches` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `sync_batches` DROP COLUMN `error_message`,
    DROP COLUMN `failed_records`,
    DROP COLUMN `finished_at`,
    DROP COLUMN `started_at`,
    DROP COLUMN `status`,
    DROP COLUMN `success_records`,
    ADD COLUMN `synced_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `total_created` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `total_updated` INTEGER NOT NULL DEFAULT 0;
