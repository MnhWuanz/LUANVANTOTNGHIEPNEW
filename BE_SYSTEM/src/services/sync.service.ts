import { prisma } from 'config/client';
import bcrypt from 'bcrypt';

export interface SyncRoom {
  roomId: string;
  roomName: string;
}

export interface SyncTeacher {
  teacherId: string;
  fullName: string;
  email: string;
}

export interface SyncSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
}

export interface SyncStudent {
  studentId: string;
  fullName: string;
  email: string;
  class: string;
}

export interface SyncPayload {
  classSectionId: string;
  subjectName: string;
  room: SyncRoom;
  teacher: SyncTeacher;
  schedules: SyncSchedule[];
  students: SyncStudent[];
}

export const SyncService = {
  sync: async (data: SyncPayload) => {
    return prisma.$transaction(async (tx) => {
      const room = await tx.room.upsert({
        where: { roomId: data.room.roomId },
        update: { roomName: data.room.roomName },
        create: { roomId: data.room.roomId, roomName: data.room.roomName },
      });
      let teacher = await tx.teacher.findUnique({
        where: { teacherId: data.teacher.teacherId },
      });
      if (!teacher) {
        teacher = await tx.teacher.findUnique({
          where: { email: data.teacher.email },
        });
      }

      if (teacher) {
        teacher = await tx.teacher.update({
          where: { teacherId: teacher.teacherId },
          data: {
            fullName: data.teacher.fullName,
            email: data.teacher.email,
          },
        });
      } else {
        teacher = await tx.teacher.create({
          data: {
            teacherId: data.teacher.teacherId,
            fullName: data.teacher.fullName,
            email: data.teacher.email,
            teacherCode: data.teacher.teacherId,
          },
        });
      }

      // 3. Sync User Account for Teacher
      let user = await tx.user.findFirst({
        where: {
          OR: [{ teacherId: teacher.teacherId }, { email: teacher.email }],
        },
      });

      if (!user) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        user = await tx.user.create({
          data: {
            email: teacher.email,
            passwordHash: hashedPassword,
            role: 'TEACHER',
            teacherId: teacher.teacherId,
          },
        });
      } else {
        user = await tx.user.update({
          where: { userId: user.userId },
          data: {
            email: teacher.email,
            teacherId: teacher.teacherId,
          },
        });
      }

      // 4. Sync ClassSection
      const classSection = await tx.classSection.upsert({
        where: { classSectionId: data.classSectionId },
        update: {
          subjectName: data.subjectName,
          roomId: room.roomId,
          teacherId: teacher.teacherId,
        },
        create: {
          classSectionId: data.classSectionId,
          subjectName: data.subjectName,
          roomId: room.roomId,
          teacherId: teacher.teacherId,
        },
      });

      // 5. Sync Schedules
      // Delete old schedules first to avoid conflicts / stale schedules
      await tx.schedule.deleteMany({
        where: { classSectionId: classSection.classSectionId },
      });

      for (const sched of data.schedules) {
        const startDate = new Date(`${sched.startDate}T00:00:00Z`);
        const endDate = new Date(`${sched.endDate}T00:00:00Z`);
        await tx.schedule.create({
          data: {
            classSectionId: classSection.classSectionId,
            dayOfWeek: sched.dayOfWeek,
            startTime: sched.startTime,
            endTime: sched.endTime,
            startDate,
            endDate,
          },
        });
      }

      // 6. Sync Students
      for (const std of data.students) {
        await tx.student.upsert({
          where: { studentId: std.studentId },
          update: {
            fullName: std.fullName,
            email: std.email,
            class: std.class,
          },
          create: {
            studentId: std.studentId,
            fullName: std.fullName,
            email: std.email,
            class: std.class,
          },
        });
      }
      // 7. Sync StudentClassSection relations
      await tx.studentClassSection.deleteMany({
        where: { classSectionId: classSection.classSectionId },
      });
      for (const std of data.students) {
        await tx.studentClassSection.create({
          data: {
            studentId: std.studentId,
            classSectionId: classSection.classSectionId,
          },
        });
      }
      return {
        classSection,
        teacher,
        user,
        room,
        studentCount: data.students.length,
      };
    });
  },
};
