import { z } from 'zod';

/**
 * Zod schema validate payload đồng bộ lớp học phần từ Phòng Đào tạo
 * sang hệ thống điểm danh.
 *
 * Dùng cho endpoint ví dụ:
 * POST /api/internal/training/sync-course-classes
 */

const positiveInt = z.coerce.number().int().positive();

const isoDateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có dạng YYYY-MM-DD');

const isoDateTime = z.string().datetime({
  offset: true,
  message: 'Thời gian phải là ISO datetime có timezone',
});

const timeString = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
    'Giờ phải có dạng HH:mm hoặc HH:mm:ss',
  );
const optionalEmail = z
  .string()
  .email('Email không hợp lệ')
  .optional()
  .nullable();

export const TrainingSubjectSchema = z.object({
  sourceSubjectId: positiveInt,
  subjectCode: z.string().trim().min(1).max(30),
  name: z.string().trim().min(1).max(255),
});

export const TrainingTeacherSchema = z.object({
  sourceTeacherId: positiveInt,
  teacherCode: z.string().trim().min(1).max(100),
  fullName: z.string().trim().min(1).max(100),
  email: optionalEmail,
});

export const TrainingRoomSchema = z.object({
  sourceRoomId: positiveInt,
  room_code: z.string().trim().min(1).max(100),
  capacity: z.coerce.number().int().positive(),
});

export const TrainingShiftSchema = z
  .object({
    sourceShiftId: positiveInt,
    name: z.string().trim().min(1).max(20),
    startTime: timeString,
    endTime: timeString,
  })
  .superRefine((data, ctx) => {
    const normalize = (value: string) =>
      value.length === 5 ? `${value}:00` : value;
    if (normalize(data.startTime) >= normalize(data.endTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endTime'],
        message: 'endTime phải lớn hơn startTime',
      });
    }
  });

export const TrainingStudentSchema = z.object({
  sourceStudentId: positiveInt,
  student_code: z.string().trim().min(1).max(100),
  full_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email('Email không hợp lệ'),
  class: z.string().trim().min(1).max(100),
});

export const TrainingCourseClassSchema = z.object({
  sourceCourseClassId: positiveInt,
  courseCode: z.string().trim().min(1).max(100),
  sourceSubjectId: positiveInt,
  sourceTeacherId: positiveInt,
});

export const TrainingCourseScheduleSchema = z.object({
  sourceCourseScheduleId: positiveInt,
  sourceCourseClassId: positiveInt,
  sourceRoomId: positiveInt,
  sourceStartShiftId: positiveInt,
  sourceEndShiftId: positiveInt,
  startDate: isoDateOnly,
  endDate: isoDateOnly,
  /**
   * Quy ước:
   * 1 = Thứ 2
   * 2 = Thứ 3
   * 3 = Thứ 4
   * 4 = Thứ 5
   * 5 = Thứ 6
   * 6 = Thứ 7
   * 7 = Chủ nhật
   */
  dayOfWeek: z.coerce.number().int().min(1).max(7),
});

export const TrainingEnrollmentSchema = z.object({
  sourceEnrollmentId: positiveInt.optional().nullable(),
  sourceCourseClassId: positiveInt,
  sourceStudentId: positiveInt,
});

export const TrainingSyncCourseClassesSchema = z
  .object({
    sourceSystem: z.literal('TRAINING_DEMO').default('TRAINING_DEMO'),
    syncedAt: isoDateTime,
    subjects: z.array(TrainingSubjectSchema).min(1),
    teachers: z.array(TrainingTeacherSchema).min(1),
    rooms: z.array(TrainingRoomSchema).min(1),
    shifts: z.array(TrainingShiftSchema).min(1),
    students: z.array(TrainingStudentSchema).min(1),
    courseClasses: z.array(TrainingCourseClassSchema).min(1),
    courseSchedules: z.array(TrainingCourseScheduleSchema).min(1),
    enrollments: z.array(TrainingEnrollmentSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const subjectIds = new Set(
      data.subjects.map((item) => item.sourceSubjectId),
    );
    const teacherIds = new Set(
      data.teachers.map((item) => item.sourceTeacherId),
    );
    const roomIds = new Set(data.rooms.map((item) => item.sourceRoomId));
    const shiftIds = new Set(data.shifts.map((item) => item.sourceShiftId));
    const studentIds = new Set(
      data.students.map((item) => item.sourceStudentId),
    );
    const courseClassIds = new Set(
      data.courseClasses.map((item) => item.sourceCourseClassId),
    );
    const addRelationError = (path: (string | number)[], message: string) => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path,
        message,
      });
    };
    data.courseClasses.forEach((courseClass, index) => {
      if (!subjectIds.has(courseClass.sourceSubjectId)) {
        addRelationError(
          ['courseClasses', index, 'sourceSubjectId'],
          'sourceSubjectId không tồn tại trong subjects',
        );
      }
      if (!teacherIds.has(courseClass.sourceTeacherId)) {
        addRelationError(
          ['courseClasses', index, 'sourceTeacherId'],
          'sourceTeacherId không tồn tại trong teachers',
        );
      }
    });
    data.courseSchedules.forEach((schedule, index) => {
      if (!courseClassIds.has(schedule.sourceCourseClassId)) {
        addRelationError(
          ['courseSchedules', index, 'sourceCourseClassId'],
          'sourceCourseClassId không tồn tại trong courseClasses',
        );
      }
      if (!roomIds.has(schedule.sourceRoomId)) {
        addRelationError(
          ['courseSchedules', index, 'sourceRoomId'],
          'sourceRoomId không tồn tại trong rooms',
        );
      }

      if (!shiftIds.has(schedule.sourceStartShiftId)) {
        addRelationError(
          ['courseSchedules', index, 'sourceStartShiftId'],
          'sourceStartShiftId không tồn tại trong shifts',
        );
      }
      if (!shiftIds.has(schedule.sourceEndShiftId)) {
        addRelationError(
          ['courseSchedules', index, 'sourceEndShiftId'],
          'sourceEndShiftId không tồn tại trong shifts',
        );
      }
      if (new Date(schedule.startDate) > new Date(schedule.endDate)) {
        addRelationError(
          ['courseSchedules', index, 'endDate'],
          'endDate phải lớn hơn hoặc bằng startDate',
        );
      }
    });
    data.enrollments.forEach((enrollment, index) => {
      if (!courseClassIds.has(enrollment.sourceCourseClassId)) {
        addRelationError(
          ['enrollments', index, 'sourceCourseClassId'],
          'sourceCourseClassId không tồn tại trong courseClasses',
        );
      }
      if (!studentIds.has(enrollment.sourceStudentId)) {
        addRelationError(
          ['enrollments', index, 'sourceStudentId'],
          'sourceStudentId không tồn tại trong students',
        );
      }
    });
    const duplicateCheck = <T>(
      items: T[],
      getKey: (item: T) => string,
      pathName: string,
      message: string,
    ) => {
      const seen = new Set<string>();

      items.forEach((item, index) => {
        const key = getKey(item);

        if (seen.has(key)) {
          addRelationError([pathName, index], message);
        }

        seen.add(key);
      });
    };
    duplicateCheck(
      data.subjects,
      (item) => String(item.sourceSubjectId),
      'subjects',
      'Trùng sourceSubjectId',
    );

    duplicateCheck(
      data.teachers,
      (item) => String(item.sourceTeacherId),
      'teachers',
      'Trùng sourceTeacherId',
    );

    duplicateCheck(
      data.rooms,
      (item) => String(item.sourceRoomId),
      'rooms',
      'Trùng sourceRoomId',
    );

    duplicateCheck(
      data.shifts,
      (item) => String(item.sourceShiftId),
      'shifts',
      'Trùng sourceShiftId',
    );

    duplicateCheck(
      data.students,
      (item) => String(item.sourceStudentId),
      'students',
      'Trùng sourceStudentId',
    );

    duplicateCheck(
      data.courseClasses,
      (item) => String(item.sourceCourseClassId),
      'courseClasses',
      'Trùng sourceCourseClassId',
    );

    duplicateCheck(
      data.courseSchedules,
      (item) => String(item.sourceCourseScheduleId),
      'courseSchedules',
      'Trùng sourceCourseScheduleId',
    );

    duplicateCheck(
      data.enrollments,
      (item) => `${item.sourceCourseClassId}:${item.sourceStudentId}`,
      'enrollments',
      'Trùng ghi danh sourceCourseClassId + sourceStudentId',
    );
  });

export type TrainingSyncCourseClassesInput = z.infer<
  typeof TrainingSyncCourseClassesSchema
>;
