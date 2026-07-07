ALTER TABLE `kiosk_devices` ADD COLUMN `device_secret_hash` VARCHAR(191) NULL;
ALTER TABLE `activation_kiosk_codes` MODIFY `code` VARCHAR(191) NOT NULL;
