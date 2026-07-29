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
      const existing = await tx.subject.findFirst({
        where: {
          OR: [
            { source_id_subject: item.sourceSubjectId },
            { subject_code: item.subjectCode },
          ],
        },
      });

      if (existing) {
        await tx.subject.update({
          where: { id_subject: existing.id_subject },
          data: {
            source_id_subject: item.sourceSubjectId,
            subject_code: item.subjectCode,
            name: item.name,
          },
        });
        summary.subjects.updated!++;
      } else {
        await tx.subject.create({
          data: {
            source_id_subject: item.sourceSubjectId,
            subject_code: item.subjectCode,
            name: item.name,
          },
        });
        summary.subjects.created++;
      }
    }

    /**
     * 2. Rooms
     */
    for (const item of payload.rooms) {
      const existing = await tx.room.findFirst({
        where: {
          OR: [
            { source_id_room: item.sourceRoomId },
            { room_code: item.room_code },
          ],
        },
      });

      if (existing) {
        await tx.room.update({
          where: { id_room: existing.id_room },
          data: {
            source_id_room: item.sourceRoomId,
            room_code: item.room_code,
            capacity: item.capacity,
          },
        });
        summary.rooms.updated!++;
      } else {
        await tx.room.create({
          data: {
            source_id_room: item.sourceRoomId,
            room_code: item.room_code,
            capacity: item.capacity,
          },
        });
        summary.rooms.created++;
      }
    }

    /**
     * 3. Shifts
     */
    for (const item of payload.shifts) {
      const existing = await tx.shift.findFirst({
        where: {
          OR: [
            { source_id_shift: item.sourceShiftId },
            { name: item.name },
          ],
        },
      });

      if (existing) {
        await tx.shift.update({
          where: { id_shift: existing.id_shift },
          data: {
            source_id_shift: item.sourceShiftId,
            name: item.name,
            start_time: toTime(item.startTime),
            end_time: toTime(item.endTime),
          },
        });
        summary.shifts.updated!++;
      } else {
        await tx.shift.create({
          data: {
            source_id_shift: item.sourceShiftId,
            name: item.name,
            start_time: toTime(item.startTime),
            end_time: toTime(item.endTime),
          },
        });
        summary.shifts.created++;
      }
    }

    /**
     * 4. Teachers + Users
     */
    for (const item of payload.teachers) {
      const existingTeacher = await tx.teacher.findFirst({
        where: {
          OR: [
            { source_id_teacher: item.sourceTeacherId },
            { teacher_code: item.teacherCode },
          ],
        },
      });

      if (!existingTeacher) {
        const teacherEmail =
          item.email && item.email.trim() !== ''
            ? item.email
            : `${item.teacherCode.toLowerCase()}@stu.edu.vn`;

        let user = await tx.user.findUnique({
          where: { email: teacherEmail },
        });

        if (!user) {
          const passworDefault = teacherEmail + '123456';
          const hashedPassword = await bcrypt.hash(passworDefault, SALT_ROUNDS);
          user = await tx.user.create({
            data: {
              email: teacherEmail,
              password_hash: hashedPassword,
              role: UserRole.TEACHER,
              is_active: true,
              createdAt: new Date(),
            },
          });
          summary.users.created++;
        }

        await tx.teacher.create({
          data: {
            source_id_teacher: item.sourceTeacherId,
            teacher_code: item.teacherCode,
            full_name: item.fullName,
            id_user: user.id_user,
          },
        });
        summary.teachers.created++;
      } else {
        await tx.teacher.update({
          where: { id_teacher: existingTeacher.id_teacher },
          data: {
            source_id_teacher: item.sourceTeacherId,
            teacher_code: item.teacherCode,
            full_name: item.fullName,
          },
        });
      }
    }

    /**
     * 5. Students
     */
    for (const item of payload.students) {
      const existingStudent = await tx.student.findFirst({
        where: {
          OR: [
            { source_id_student: item.sourceStudentId },
            { student_code: item.student_code },
          ],
        },
      });

      if (existingStudent) {
        await tx.student.update({
          where: { id_student: existingStudent.id_student },
          data: {
            source_id_student: item.sourceStudentId,
            student_code: item.student_code,
            full_name: item.full_name,
            email: item.email || existingStudent.email,
            class: item.class,
          },
        });
        summary.students.updated!++;
      } else {
        await tx.student.create({
          data: {
            source_id_student: item.sourceStudentId,
            student_code: item.student_code,
            full_name: item.full_name,
            email: item.email!,
            class: item.class,
            is_face_registered: false,
          },
        });
        summary.students.created++;
      }
    }

    /**
     * 6. Course classes
     */
    for (const item of payload.courseClasses) {
      const subject = await tx.subject.findFirstOrThrow({
        where: {
          OR: [
            { source_id_subject: item.sourceSubjectId },
          ],
        },
      });

      const teacher = await tx.teacher.findFirstOrThrow({
        where: {
          OR: [
            { source_id_teacher: item.sourceTeacherId },
          ],
        },
      });

      const existingCourseClass = await tx.course_Class.findFirst({
        where: {
          OR: [
            { source_id_course_class: item.sourceCourseClassId },
            { course_code: item.courseCode },
          ],
        },
      });

      if (existingCourseClass) {
        await tx.course_Class.update({
          where: { id_course_class: existingCourseClass.id_course_class },
          data: {
            source_id_course_class: item.sourceCourseClassId,
            course_code: item.courseCode,
            id_subject: subject.id_subject,
            id_teacher: teacher.id_teacher,
          },
        });
        summary.courseClasses.updated!++;
      } else {
        await tx.course_Class.create({
          data: {
            source_id_course_class: item.sourceCourseClassId,
            course_code: item.courseCode,
            id_subject: subject.id_subject,
            id_teacher: teacher.id_teacher,
          },
        });
        summary.courseClasses.created++;
      }
    }

    /**
     * 7. Course schedules
     */
    for (const item of payload.courseSchedules) {
      const courseClass = await tx.course_Class.findFirstOrThrow({
        where: {
          source_id_course_class: item.sourceCourseClassId,
        },
      });

      const room = await tx.room.findFirstOrThrow({
        where: {
          source_id_room: item.sourceRoomId,
        },
      });

      const startShift = await tx.shift.findFirstOrThrow({
        where: {
          OR: [
            { source_id_shift: item.sourceStartShiftId },
          ],
        },
      });

      const endShift = await tx.shift.findFirstOrThrow({
        where: {
          OR: [
            { source_id_shift: item.sourceEndShiftId },
          ],
        },
      });

      const existingSchedule = await tx.course_Schedule.findFirst({
        where: {
          OR: [
            { source_id_course_schedule: item.sourceCourseScheduleId },
            {
              id_course_class: courseClass.id_course_class,
              id_room: room.id_room,
              id_start_shift: startShift.id_shift,
              day_of_week: item.dayOfWeek,
            },
          ],
        },
      });

      if (existingSchedule) {
        await tx.course_Schedule.update({
          where: { id_course_schedule: existingSchedule.id_course_schedule },
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
        });
        summary.courseSchedules.updated!++;
      } else {
        await tx.course_Schedule.create({
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
        });
        summary.courseSchedules.created++;
      }
    }

    /**
     * 8. Enrollments
     */
    for (const item of payload.enrollments) {
      const student = await tx.student.findFirstOrThrow({
        where: {
          OR: [
            { source_id_student: item.sourceStudentId },
          ],
        },
      });

      const courseClass = await tx.course_Class.findFirstOrThrow({
        where: {
          OR: [
            { source_id_course_class: item.sourceCourseClassId },
          ],
        },
      });

      const existingEnrollment = item.sourceEnrollmentId
        ? await tx.enrollment.findFirst({
            where: {
              OR: [
                { source_id_enrollment: item.sourceEnrollmentId },
                {
                  id_student: student.id_student,
                  id_course_class: courseClass.id_course_class,
                },
              ],
            },
          })
        : await tx.enrollment.findFirst({
            where: {
              id_student: student.id_student,
              id_course_class: courseClass.id_course_class,
            },
          });

      if (existingEnrollment) {
        await tx.enrollment.update({
          where: { id_enrollment: existingEnrollment.id_enrollment },
          data: {
            source_id_enrollment:
              item.sourceEnrollmentId ?? existingEnrollment.source_id_enrollment,
            id_student: student.id_student,
            id_course_class: courseClass.id_course_class,
          },
        });
        summary.enrollments.updated!++;
      } else {
        await tx.enrollment.create({
          data: {
            source_id_enrollment: item.sourceEnrollmentId!,
            id_student: student.id_student,
            id_course_class: courseClass.id_course_class,
          },
        });
        summary.enrollments.created++;
      }
    }

    return {
      success: true,
      message: 'Đồng bộ dữ liệu lớp học phần thành công',
      summary,
    };
  }, {
    timeout: 180000,
    maxWait: 10000,
  });
};
