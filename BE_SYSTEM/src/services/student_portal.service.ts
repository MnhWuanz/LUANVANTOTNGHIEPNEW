import {
  AttendanceRecordStatus,
  AttendanceSessionStatus,
} from '@prisma/client';
import { prisma } from 'config/client';
import { updateAttendanceSessionStatuses } from 'services/attendance_session.service';
import type { StudentPortalAttendanceQuery } from 'validation/student_portal.validation';

type StudentAttendanceParams = StudentPortalAttendanceQuery & {
  studentCode: string;
};

type CourseAttendanceSummary = {
  present: number;
  late: number;
  absent: number;
  pending: number;
  totalSessions: number;
  attendedSessions: number;
  attendanceRate: number;
};

const emptySummary = (): CourseAttendanceSummary => ({
  present: 0,
  late: 0,
  absent: 0,
  pending: 0,
  totalSessions: 0,
  attendedSessions: 0,
  attendanceRate: 0,
});

function toDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDateOnly(date: Date) {
  return date.toISOString().split('T')[0];
}

function buildShiftLabel(startShiftName: string, endShiftName: string) {
  return startShiftName === endShiftName
    ? startShiftName
    : `${startShiftName} - ${endShiftName}`;
}

function getAttendanceRate(attended: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((attended / total) * 100);
}

function getEffectiveAttendanceStatus(params: {
  recordStatus?: AttendanceRecordStatus;
  sessionStatus: AttendanceSessionStatus;
}) {
  if (params.recordStatus) {
    return params.recordStatus;
  }

  if (params.sessionStatus === AttendanceSessionStatus.CLOSED) {
    return AttendanceRecordStatus.ABSENT;
  }

  return 'PENDING';
}

function addStatusToSummary(
  summary: CourseAttendanceSummary,
  effectiveStatus: AttendanceRecordStatus | 'PENDING',
) {
  summary.totalSessions++;

  if (effectiveStatus === AttendanceRecordStatus.PRESENT) {
    summary.present++;
    return;
  }

  if (effectiveStatus === AttendanceRecordStatus.LATE) {
    summary.late++;
    return;
  }

  if (effectiveStatus === AttendanceRecordStatus.ABSENT) {
    summary.absent++;
    return;
  }

  summary.pending++;
}

const getStudentAttendanceByCourse = async (params: StudentAttendanceParams) => {
  await updateAttendanceSessionStatuses();

  const student = await prisma.student.findUnique({
    where: {
      student_code: params.studentCode,
    },
    select: {
      id_student: true,
      source_id_student: true,
      student_code: true,
      full_name: true,
      email: true,
      class: true,
      enrollments: {
        where: params.courseCode
          ? {
              course_class: {
                course_code: params.courseCode,
              },
            }
          : undefined,
        select: {
          id_enrollment: true,
          course_class: {
            select: {
              id_course_class: true,
              course_code: true,
              subject: {
                select: {
                  subject_code: true,
                  name: true,
                },
              },
              teacher: {
                select: {
                  teacher_code: true,
                  full_name: true,
                },
              },
            },
          },
        },
        orderBy: {
          course_class: {
            course_code: 'asc',
          },
        },
      },
    },
  });

  if (!student) {
    return null;
  }

  const courseClassIds = student.enrollments.map(
    (enrollment) => enrollment.course_class.id_course_class,
  );
  const sessionDateFilter = {
    ...(params.from ? { gte: toDateOnly(params.from) } : {}),
    ...(params.to ? { lte: toDateOnly(params.to) } : {}),
  };

  const sessions =
    courseClassIds.length > 0
      ? await prisma.attendance_Session.findMany({
          where: {
            ...(Object.keys(sessionDateFilter).length > 0
              ? { session_date: sessionDateFilter }
              : {}),
            course_schedule: {
              id_course_class: {
                in: courseClassIds,
              },
            },
          },
          include: {
            attendanceRecords: {
              where: {
                id_student: student.id_student,
              },
              select: {
                id_attendance_record: true,
                status: true,
                confidence: true,
                checkin_time: true,
                created_at: true,
              },
              take: 1,
            },
            course_schedule: {
              include: {
                room: {
                  select: {
                    room_code: true,
                  },
                },
                start_shift: {
                  select: {
                    name: true,
                    start_time: true,
                  },
                },
                end_shift: {
                  select: {
                    name: true,
                    end_time: true,
                  },
                },
                course_class: {
                  select: {
                    id_course_class: true,
                  },
                },
              },
            },
          },
          orderBy: [{ session_date: 'asc' }, { checkin_open_at: 'asc' }],
        })
      : [];

  const groups = new Map<
    number,
    {
      idCourseClass: number;
      courseCode: string;
      subject: {
        subjectCode: string;
        name: string;
      };
      teacher: {
        teacherCode: string;
        fullName: string;
      };
      summary: CourseAttendanceSummary;
      sessions: any[];
    }
  >();

  for (const enrollment of student.enrollments) {
    const courseClass = enrollment.course_class;

    groups.set(courseClass.id_course_class, {
      idCourseClass: courseClass.id_course_class,
      courseCode: courseClass.course_code,
      subject: {
        subjectCode: courseClass.subject.subject_code,
        name: courseClass.subject.name,
      },
      teacher: {
        teacherCode: courseClass.teacher.teacher_code,
        fullName: courseClass.teacher.full_name,
      },
      summary: emptySummary(),
      sessions: [],
    });
  }

  for (const session of sessions) {
    const courseClassId = session.course_schedule.course_class.id_course_class;
    const group = groups.get(courseClassId);

    if (!group) {
      continue;
    }

    const record = session.attendanceRecords[0] ?? null;
    const effectiveStatus = getEffectiveAttendanceStatus({
      recordStatus: record?.status,
      sessionStatus: session.status,
    });
    const inferredAbsent =
      !record &&
      effectiveStatus === AttendanceRecordStatus.ABSENT &&
      session.status === AttendanceSessionStatus.CLOSED;

    addStatusToSummary(group.summary, effectiveStatus);

    group.sessions.push({
      idAttendanceSession: session.id_attendance_session,
      idAttendanceRecord: record?.id_attendance_record ?? null,
      sessionDate: formatDateOnly(session.session_date),
      sessionStatus: session.status,
      effectiveAttendanceStatus: effectiveStatus,
      inferredAbsent,
      checkinOpenAt: session.checkin_open_at.toISOString(),
      checkinCloseAt: session.checkin_close_at.toISOString(),
      checkinTime: record?.checkin_time?.toISOString() ?? null,
      recordStatus: record?.status ?? null,
      confidence: record?.confidence ?? null,
      roomCode: session.course_schedule.room.room_code,
      shift: buildShiftLabel(
        session.course_schedule.start_shift.name,
        session.course_schedule.end_shift.name,
      ),
    });
  }

  const courses = Array.from(groups.values()).map((group) => {
    group.summary.attendedSessions = group.summary.present + group.summary.late;
    group.summary.attendanceRate = getAttendanceRate(
      group.summary.attendedSessions,
      group.summary.totalSessions,
    );

    return group;
  });

  return {
    generatedAt: new Date().toISOString(),
    filters: {
      from: params.from ?? null,
      to: params.to ?? null,
      courseCode: params.courseCode ?? null,
    },
    student: {
      idStudent: student.id_student,
      sourceIdStudent: student.source_id_student,
      studentCode: student.student_code,
      fullName: student.full_name,
      email: student.email,
      class: student.class,
    },
    totalCourseClasses: courses.length,
    courses,
  };
};

export const StudentPortalService = {
  getStudentAttendanceByCourse,
};
