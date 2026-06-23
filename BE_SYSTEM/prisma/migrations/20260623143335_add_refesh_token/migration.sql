/*
  Warnings:

  - You are about to drop the `refresh_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `refresh_tokens` DROP FOREIGN KEY `refresh_tokens_userId_fkey`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `refreshToken` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `refresh_tokens`;

-- CreateTable
CREATE TABLE `rooms` (
    `roomId` VARCHAR(191) NOT NULL,
    `roomName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`roomId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `class_sections` (
    `classSectionId` VARCHAR(191) NOT NULL,
    `subjectName` VARCHAR(191) NOT NULL,
    `roomId` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`classSectionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedules` (
    `scheduleId` VARCHAR(191) NOT NULL,
    `classSectionId` VARCHAR(191) NOT NULL,
    `dayOfWeek` INTEGER NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,

    PRIMARY KEY (`scheduleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `studentId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `class` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `students_email_key`(`email`),
    PRIMARY KEY (`studentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_class_sections` (
    `studentId` VARCHAR(191) NOT NULL,
    `classSectionId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`studentId`, `classSectionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `class_sections` ADD CONSTRAINT `class_sections_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`roomId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `class_sections` ADD CONSTRAINT `class_sections_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teachers`(`teacherId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_classSectionId_fkey` FOREIGN KEY (`classSectionId`) REFERENCES `class_sections`(`classSectionId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_class_sections` ADD CONSTRAINT `student_class_sections_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`studentId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_class_sections` ADD CONSTRAINT `student_class_sections_classSectionId_fkey` FOREIGN KEY (`classSectionId`) REFERENCES `class_sections`(`classSectionId`) ON DELETE CASCADE ON UPDATE CASCADE;
