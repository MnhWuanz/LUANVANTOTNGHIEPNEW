import { UserRole } from '@prisma/client';
import { prisma } from 'config/client';
import { TrainingSyncCourseClassesInput } from 'validation/sync.validation';
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;
type CountSummary = {
  created: number;
  updated?: number;
};
export type TrainingSyncSummary = {
  users: CountSummary;
  subjects: CountSummary;
  teachers: CountSummary;
  rooms: CountSummary;
  shifts: CountSummary;
  students: CountSummary;
  courseClasses: CountSummary;
  courseSchedules: CountSummary;
  enrollments: CountSummary;
};
export type TrainingSyncResult = {
  success: true;
  message: string;
  summary: TrainingSyncSummary;
};

function createEmptySummary(): TrainingSyncSummary {
  return {
    users: { created: 0 },
    subjects: { created: 0, updated: 0 },
    teachers: { created: 0 },
    rooms: { created: 0, updated: 0 },
    shifts: { created: 0, updated: 0 },
    students: { created: 0, updated: 0 },
    courseClasses: { created: 0, updated: 0 },
    courseSchedules: { created: 0, updated: 0 },
    enrollments: { created: 0, updated: 0 },
  };
}

function toDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function toTime(value: string): Date {
  const normalized = value.length === 5 ? `${value}:00` : value;
  return new Date(`1970-01-01T${normalized}.000Z`);
}

export const SyncService = async (payload: TrainingSyncCourseClassesInput) => {
  const summary = createEmptySummary();

  return prisma.$transaction(async (tx) => {
    /**
     * 1. Subjects
     */
    for (const item of payload.subjects) {
      const existing = await tx.subject.findUnique({
        where: { source_id_subject: item.sourceSubjectId },
        select: { id_subject: true },
      });
      existing
        ? (await tx.subject.update({
            where: { source_id_subject: item.sourceSubjectId },
            data: {
              subject_code: item.subjectCode,
              name: item.name,
            },
          }),
          summary.subjects.updated!++)
        : (await tx.subject.create({
            data: {
              source_id_subject: item.sourceSubjectId,
              subject_code: item.subjectCode,
              name: item.name,
            },
          }),
          summary.subjects.created++);
    }
    /**
     * 2. Rooms
     */
    for (const item of payload.rooms) {
      const existing = await tx.room.findUnique({
        where: { source_id_room: item.sourceRoomId },
      });
      existing
        ? (await tx.room.update({
            where: { source_id_room: item.sourceRoomId },
            data: {
              room_code: item.room_code,
              capacity: item.capacity,
            },
          }),
          summary.rooms.updated!++)
        : (await tx.room.create({
            data: {
              source_id_room: item.sourceRoomId,
              room_code: item.room_code,
              capacity: item.capacity,
            },
          }),
          summary.rooms.created++);
    }

    /**
     * 3. Shifts
     */
    for (const item of payload.shifts) {
      const existing = await tx.shift.findUnique({
        where: { source_id_shift: item.sourceShiftId },
      });
      existing
        ? (await tx.shift.update({
            where: { source_id_shift: item.sourceShiftId },
            data: {
              name: item.name,
              start_time: toTime(item.startTime),
              end_time: toTime(item.endTime),
            },
          }),
          summary.shifts.updated!++)
        : (await tx.shift.create({
            data: {
              source_id_shift: item.sourceShiftId,
              name: item.name,
              start_time: toTime(item.startTime),
              end_time: toTime(item.endTime),
            },
          }),
          summary.shifts.created++);
    }
    /**
     * 4. Teachers + Users
     */
    for (const item of payload.teachers) {
      const existingTeacher = await tx.teacher.findUnique({
        where: {
          source_id_teacher: item.sourceTeacherId,
        },
      });
      if (!existingTeacher) {
        const passworDefault = item.email! + '123456';
        const hashedPassword = await bcrypt.hash(passworDefault, SALT_ROUNDS);
        const user = await tx.user.create({
          data: {
            email: item.email!,
            password_hash: hashedPassword,
            role: UserRole.TEACHER,
            is_active: true,
            createdAt: new Date(),
          },
        });
        await tx.teacher.create({
          data: {
            source_id_teacher: item.sourceTeacherId,
            teacher_code: item.teacherCode,
            full_name: item.fullName,
            id_user: user.id_user,
          },
        });
        summary.teachers.created++;
        summary.users.created++;
      }
    }

    /**
     * 5. Students
     */
    for (const item of payload.students) {
      const existingStudent = await tx.student.findUnique({
        where: {
          source_id_student: item.sourceStudentId,
        },
      });
      existingStudent
        ? (await tx.student.update({
            where: {
              source_id_student: item.sourceStudentId,
            },
            data: {
              student_code: item.student_code,
              full_name: item.full_name,
              email: item.email!,
              class: item.class,
            },
          }),
          summary.students.updated!++)
        : (await tx.student.create({
            data: {
              source_id_student: item.sourceStudentId,
              student_code: item.student_code,
              full_name: item.full_name,
              email: item.email!,
              class: item.class,
              is_face_registered: false,
            },
          }),
          summary.students.created++);
    }
    /**
     * 6. Course classes
     */
    for (const item of payload.courseClasses) {
      const subject = await tx.subject.findUniqueOrThrow({
        where: {
          source_id_subject: item.sourceSubjectId,
        },
      });
      const teacher = await tx.teacher.findUniqueOrThrow({
        where: {
          source_id_teacher: item.sourceTeacherId,
        },
      });
      const existingCourseClass = await tx.course_Class.findUnique({
        where: {
          source_id_course_class: item.sourceCourseClassId,
        },
      });
      existingCourseClass
        ? (await tx.course_Class.update({
            where: {
              source_id_course_class: item.sourceCourseClassId,
            },
            data: {
              course_code: item.courseCode,
              id_subject: subject.id_subject,
              id_teacher: teacher.id_teacher,
            },
          }),
          summary.courseClasses.updated!++)
        : (await tx.course_Class.create({
            data: {
              source_id_course_class: item.sourceCourseClassId,
              course_code: item.courseCode,
              id_subject: subject.id_subject,
              id_teacher: teacher.id_teacher,
            },
          }),
          summary.courseClasses.created++);
    }

    /**
     * 7. Course schedules
     */
    for (const item of payload.courseSchedules) {
      const courseClass = await tx.course_Class.findUniqueOrThrow({
        where: {
          source_id_course_class: item.sourceCourseClassId,
        },
      });

      const room = await tx.room.findUniqueOrThrow({
        where: {
          source_id_room: item.sourceRoomId,
        },
      });

      const startShift = await tx.shift.findUniqueOrThrow({
        where: {
          source_id_shift: item.sourceStartShiftId,
        },
      });
      const endShift = await tx.shift.findUniqueOrThrow({
        where: {
          source_id_shift: item.sourceEndShiftId,
        },
      });
      const existingSchedule = await tx.course_Schedule.findUnique({
        where: {
          source_id_course_schedule: item.sourceCourseScheduleId,
        },
      });
      existingSchedule
        ? (await tx.course_Schedule.update({
            where: {
              source_id_course_schedule: item.sourceCourseScheduleId,
            },
            data: {
              id_course_class: courseClass.id_course_class,
              id_room: room.id_room,
              id_start_shift: startShift.id_shift,
              id_end_shift: endShift.id_shift,
              start_date: toDateOnly(item.startDate),
              end_date: toDateOnly(item.endDate),
              day_of_week: item.dayOfWeek,
            },
          }),
          summary.courseSchedules.updated!++)
        : (await tx.course_Schedule.create({
            data: {
              source_id_course_schedule: item.sourceCourseScheduleId,
              id_course_class: courseClass.id_course_class,
              id_room: room.id_room,
              id_start_shift: startShift.id_shift,
              id_end_shift: endShift.id_shift,
              start_date: toDateOnly(item.startDate),
              end_date: toDateOnly(item.endDate),
              day_of_week: item.dayOfWeek,
            },
          }),
          summary.courseSchedules.created++);
    }

    /**
     * 8. Enrollments
     */
    for (const item of payload.enrollments) {
      const student = await tx.student.findUniqueOrThrow({
        where: {
          source_id_student: item.sourceStudentId,
        },
      });

      const courseClass = await tx.course_Class.findUniqueOrThrow({
        where: {
          source_id_course_class: item.sourceCourseClassId,
        },
      });
      const existingEnrollment = await tx.enrollment.findUnique({
        where: {
          source_id_enrollment: item.sourceEnrollmentId!,
        },
      });
      existingEnrollment
        ? (await tx.enrollment.update({
            where: {
              source_id_enrollment: item.sourceEnrollmentId!,
            },
            data: {
              id_student: student.id_student,
              id_course_class: courseClass.id_course_class,
            },
          }),
          summary.enrollments.updated!++)
        : (await tx.enrollment.create({
            data: {
              source_id_enrollment: item.sourceEnrollmentId!,
              id_student: student.id_student,
              id_course_class: courseClass.id_course_class,
            },
          }),
          summary.enrollments.created++);
    }

    return {
      success: true,
      message: 'Đồng bộ dữ liệu lớp học phần thành công',
      summary,
    };
  });
};
