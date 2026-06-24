/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `passwordHash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `class_sections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rooms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `schedules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_class_sections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `students` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teachers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id_user` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `class_sections` DROP FOREIGN KEY `class_sections_roomId_fkey`;

-- DropForeignKey
ALTER TABLE `class_sections` DROP FOREIGN KEY `class_sections_teacherId_fkey`;

-- DropForeignKey
ALTER TABLE `schedules` DROP FOREIGN KEY `schedules_classSectionId_fkey`;

-- DropForeignKey
ALTER TABLE `student_class_sections` DROP FOREIGN KEY `student_class_sections_classSectionId_fkey`;

-- DropForeignKey
ALTER TABLE `student_class_sections` DROP FOREIGN KEY `student_class_sections_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_teacherId_fkey`;

-- DropIndex
DROP INDEX `users_role_idx` ON `users`;

-- DropIndex
DROP INDEX `users_teacherId_key` ON `users`;

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    DROP COLUMN `passwordHash`,
    DROP COLUMN `refreshToken`,
    DROP COLUMN `teacherId`,
    DROP COLUMN `userId`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `last_login` TIMESTAMP(6) NULL,
    ADD COLUMN `password_hash` VARCHAR(191) NOT NULL,
    ADD COLUMN `refresh_token_hash` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`id_user`);

-- DropTable
DROP TABLE `class_sections`;

-- DropTable
DROP TABLE `rooms`;

-- DropTable
DROP TABLE `schedules`;

-- DropTable
DROP TABLE `student_class_sections`;

-- DropTable
DROP TABLE `students`;

-- DropTable
DROP TABLE `teachers`;

-- CreateTable
CREATE TABLE `edu_teachers` (
    `id_teacher` INTEGER NOT NULL AUTO_INCREMENT,
    `source_id_teacher` INTEGER NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `teacher_code` VARCHAR(191) NOT NULL,
    `id_user` INTEGER NOT NULL,

    UNIQUE INDEX `edu_teachers_source_id_teacher_key`(`source_id_teacher`),
    UNIQUE INDEX `edu_teachers_teacher_code_key`(`teacher_code`),
    UNIQUE INDEX `edu_teachers_id_user_key`(`id_user`),
    PRIMARY KEY (`id_teacher`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `edu_subjects` (
    `id_subject` INTEGER NOT NULL AUTO_INCREMENT,
    `source_id_subject` INTEGER NOT NULL,
    `subject_code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `edu_subjects_source_id_subject_key`(`source_id_subject`),
    UNIQUE INDEX `edu_subjects_subject_code_key`(`subject_code`),
    PRIMARY KEY (`id_subject`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `edu_rooms` (
    `id_room` INTEGER NOT NULL AUTO_INCREMENT,
    `source_id_room` INTEGER NOT NULL,
    `room_code` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL,

    UNIQUE INDEX `edu_rooms_source_id_room_key`(`source_id_room`),
    UNIQUE INDEX `edu_rooms_room_code_key`(`room_code`),
    PRIMARY KEY (`id_room`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `edu_shifts` (
    `id_shift` INTEGER NOT NULL AUTO_INCREMENT,
    `source_id_shift` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,

    UNIQUE INDEX `edu_shifts_source_id_shift_key`(`source_id_shift`),
    UNIQUE INDEX `edu_shifts_name_key`(`name`),
    PRIMARY KEY (`id_shift`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `edu_students` (
    `id_student` INTEGER NOT NULL AUTO_INCREMENT,
    `source_id_student` INTEGER NOT NULL,
    `student_code` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `class` VARCHAR(191) NOT NULL,
    `is_face_registered` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `edu_students_source_id_student_key`(`source_id_student`),
    UNIQUE INDEX `edu_students_student_code_key`(`student_code`),
    UNIQUE INDEX `edu_students_email_key`(`email`),
    PRIMARY KEY (`id_student`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `edu_course_classes` (
    `id_course_class` INTEGER NOT NULL AUTO_INCREMENT,
    `source_id_course_class` INTEGER NOT NULL,
    `course_code` VARCHAR(191) NOT NULL,
    `id_subject` INTEGER NOT NULL,
    `id_teacher` INTEGER NOT NULL,

    UNIQUE INDEX `edu_course_classes_source_id_course_class_key`(`source_id_course_class`),
    UNIQUE INDEX `edu_course_classes_course_code_key`(`course_code`),
    PRIMARY KEY (`id_course_class`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `edu_enrollments` (
    `id_enrollment` INTEGER NOT NULL AUTO_INCREMENT,
    `source_id_enrollment` INTEGER NOT NULL,
    `id_student` INTEGER NOT NULL,
    `id_course_class` INTEGER NOT NULL,

    UNIQUE INDEX `edu_enrollments_source_id_enrollment_key`(`source_id_enrollment`),
    UNIQUE INDEX `edu_enrollments_id_student_id_course_class_key`(`id_student`, `id_course_class`),
    PRIMARY KEY (`id_enrollment`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `edu_course_schedules` (
    `id_course_schedule` INTEGER NOT NULL AUTO_INCREMENT,
    `source_id_course_schedule` INTEGER NOT NULL,
    `id_course_class` INTEGER NOT NULL,
    `id_room` INTEGER NOT NULL,
    `id_start_shift` INTEGER NOT NULL,
    `id_end_shift` INTEGER NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `day_of_week` INTEGER NOT NULL,

    UNIQUE INDEX `edu_course_schedules_source_id_course_schedule_key`(`source_id_course_schedule`),
    PRIMARY KEY (`id_course_schedule`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `face_enrollments` (
    `id_face_enrollment` INTEGER NOT NULL AUTO_INCREMENT,
    `face_id` VARCHAR(191) NOT NULL,
    `collection_id` VARCHAR(191) NOT NULL,
    `image_url` VARCHAR(191) NULL,
    `image_s3_key` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'REPLACED', 'FAILED') NOT NULL,
    `quality_score` DOUBLE NULL,
    `enrolled_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_student` INTEGER NOT NULL,
    `id_user` INTEGER NOT NULL,

    UNIQUE INDEX `face_enrollments_collection_id_face_id_key`(`collection_id`, `face_id`),
    PRIMARY KEY (`id_face_enrollment`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kiosk_devices` (
    `id_kiosk` INTEGER NOT NULL AUTO_INCREMENT,
    `device_code` VARCHAR(191) NOT NULL,
    `device_name` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'BLOCKED') NOT NULL DEFAULT 'PENDING',
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `activated_at` DATETIME(3) NULL,
    `last_seen_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `id_room` INTEGER NOT NULL,

    UNIQUE INDEX `kiosk_devices_device_code_key`(`device_code`),
    UNIQUE INDEX `kiosk_devices_id_room_key`(`id_room`),
    PRIMARY KEY (`id_kiosk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activation_kiosk_codes` (
    `id_activation_code` INTEGER NOT NULL AUTO_INCREMENT,
    `code` INTEGER NOT NULL,
    `is_used` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_kiosk` INTEGER NULL,

    UNIQUE INDEX `activation_kiosk_codes_code_key`(`code`),
    PRIMARY KEY (`id_activation_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_sessions` (
    `id_attendance_session` INTEGER NOT NULL AUTO_INCREMENT,
    `id_course_schedule` INTEGER NOT NULL,
    `session_date` DATE NOT NULL,
    `status` ENUM('NOT_STARTED', 'OPEN', 'CLOSED') NOT NULL,
    `checkin_open_at` DATETIME(3) NOT NULL,
    `checkin_close_at` DATETIME(3) NOT NULL,
    `opened_at` DATETIME(3) NULL,
    `closed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `attendance_sessions_id_course_schedule_session_date_key`(`id_course_schedule`, `session_date`),
    PRIMARY KEY (`id_attendance_session`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_records` (
    `id_attendance_record` INTEGER NOT NULL AUTO_INCREMENT,
    `id_attendance_session` INTEGER NOT NULL,
    `id_student` INTEGER NOT NULL,
    `id_face_enrollment` INTEGER NULL,
    `id_kiosk` INTEGER NULL,
    `confidence` DOUBLE NULL,
    `status` ENUM('PRESENT', 'ABSENT', 'LATE') NOT NULL,
    `checkin_time` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `enrollmentId_enrollment` INTEGER NULL,

    UNIQUE INDEX `attendance_records_id_attendance_session_id_student_key`(`id_attendance_session`, `id_student`),
    PRIMARY KEY (`id_attendance_record`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `edu_teachers` ADD CONSTRAINT `edu_teachers_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `edu_course_classes` ADD CONSTRAINT `edu_course_classes_id_subject_fkey` FOREIGN KEY (`id_subject`) REFERENCES `edu_subjects`(`id_subject`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `edu_course_classes` ADD CONSTRAINT `edu_course_classes_id_teacher_fkey` FOREIGN KEY (`id_teacher`) REFERENCES `edu_teachers`(`id_teacher`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `edu_enrollments` ADD CONSTRAINT `edu_enrollments_id_student_fkey` FOREIGN KEY (`id_student`) REFERENCES `edu_students`(`id_student`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `edu_enrollments` ADD CONSTRAINT `edu_enrollments_id_course_class_fkey` FOREIGN KEY (`id_course_class`) REFERENCES `edu_course_classes`(`id_course_class`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `edu_course_schedules` ADD CONSTRAINT `edu_course_schedules_id_course_class_fkey` FOREIGN KEY (`id_course_class`) REFERENCES `edu_course_classes`(`id_course_class`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `edu_course_schedules` ADD CONSTRAINT `edu_course_schedules_id_room_fkey` FOREIGN KEY (`id_room`) REFERENCES `edu_rooms`(`id_room`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `edu_course_schedules` ADD CONSTRAINT `edu_course_schedules_id_start_shift_fkey` FOREIGN KEY (`id_start_shift`) REFERENCES `edu_shifts`(`id_shift`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `edu_course_schedules` ADD CONSTRAINT `edu_course_schedules_id_end_shift_fkey` FOREIGN KEY (`id_end_shift`) REFERENCES `edu_shifts`(`id_shift`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `face_enrollments` ADD CONSTRAINT `face_enrollments_id_student_fkey` FOREIGN KEY (`id_student`) REFERENCES `edu_students`(`id_student`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `face_enrollments` ADD CONSTRAINT `face_enrollments_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kiosk_devices` ADD CONSTRAINT `kiosk_devices_id_room_fkey` FOREIGN KEY (`id_room`) REFERENCES `edu_rooms`(`id_room`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activation_kiosk_codes` ADD CONSTRAINT `activation_kiosk_codes_id_kiosk_fkey` FOREIGN KEY (`id_kiosk`) REFERENCES `kiosk_devices`(`id_kiosk`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_sessions` ADD CONSTRAINT `attendance_sessions_id_course_schedule_fkey` FOREIGN KEY (`id_course_schedule`) REFERENCES `edu_course_schedules`(`id_course_schedule`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_records` ADD CONSTRAINT `attendance_records_id_attendance_session_fkey` FOREIGN KEY (`id_attendance_session`) REFERENCES `attendance_sessions`(`id_attendance_session`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_records` ADD CONSTRAINT `attendance_records_id_student_fkey` FOREIGN KEY (`id_student`) REFERENCES `edu_students`(`id_student`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_records` ADD CONSTRAINT `attendance_records_id_face_enrollment_fkey` FOREIGN KEY (`id_face_enrollment`) REFERENCES `face_enrollments`(`id_face_enrollment`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_records` ADD CONSTRAINT `attendance_records_id_kiosk_fkey` FOREIGN KEY (`id_kiosk`) REFERENCES `kiosk_devices`(`id_kiosk`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_records` ADD CONSTRAINT `attendance_records_enrollmentId_enrollment_fkey` FOREIGN KEY (`enrollmentId_enrollment`) REFERENCES `edu_enrollments`(`id_enrollment`) ON DELETE SET NULL ON UPDATE CASCADE;
