import { AttendanceSessionStatus } from '@prisma/client';
import { prisma } from 'config/client';

const APP_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const APP_UTC_OFFSET_HOURS = 7;

function toDateOnlyUtc(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  );

  return new Date(Date.UTC(values.year, values.month - 1, values.day));
}

function getTrainingDayOfWeek(dateOnlyUtc: Date) {
  const jsDay = dateOnlyUtc.getUTCDay();

  return jsDay === 0 ? 7 : jsDay;
}

function combineDateAndTime(dateOnlyUtc: Date, time: Date) {
  return new Date(
    Date.UTC(
      dateOnlyUtc.getUTCFullYear(),
      dateOnlyUtc.getUTCMonth(),
      dateOnlyUtc.getUTCDate(),
      time.getUTCHours() - APP_UTC_OFFSET_HOURS,
      time.getUTCMinutes(),
      time.getUTCSeconds(),
      0,
    ),
  );
}

function getAttendanceRate(attended: number, total: number) {
  if (total <= 0) {
    return 0;
  }
  return Math.round((attended / total) * 100);
}

export const generateAttendanceSession = async (date = new Date()) => {
  const sessionDate = toDateOnlyUtc(new Date(date));
  const dayOfWeek = getTrainingDayOfWeek(sessionDate);
  const schedules = await prisma.course_Schedule.findMany({
    where: {
      start_date: { lte: sessionDate },
      end_date: { gte: sessionDate },
      day_of_week: dayOfWeek,
    },
    include: {
      start_shift: true,
      end_shift: true,
    },
  });

  let created = 0;
  let existed = 0;

  for (const schedule of schedules) {
    const checkinOpenAt = combineDateAndTime(
      sessionDate,
      schedule.start_shift.start_time,
    );
    const checkinCloseAt = combineDateAndTime(
      sessionDate,
      schedule.end_shift.end_time,
    );
    const existingSession = await prisma.attendance_Session.findUnique({
      where: {
        id_course_schedule_session_date: {
          id_course_schedule: schedule.id_course_schedule,
          session_date: sessionDate,
        },
      },
      select: {
        id_attendance_session: true,
        status: true,
      },
    });

    if (existingSession) {
      if (existingSession.status === AttendanceSessionStatus.NOT_STARTED) {
        await prisma.attendance_Session.update({
          where: {
            id_attendance_session: existingSession.id_attendance_session,
          },
          data: {
            checkin_open_at: checkinOpenAt,
            checkin_close_at: checkinCloseAt,
          },
        });
      }

      existed++;
      continue;
    }

    await prisma.attendance_Session.create({
      data: {
        id_course_schedule: schedule.id_course_schedule,
        session_date: sessionDate,
        status: AttendanceSessionStatus.NOT_STARTED,
        checkin_open_at: checkinOpenAt,
        checkin_close_at: checkinCloseAt,
      },
    });
    created++;
  }

  return {
    date: sessionDate.toISOString().split('T')[0],
    totalSchedules: schedules.length,
    created,
    existed,
  };
};

export const closeExpiredAttendanceSessions = async () => {
  const now = new Date();
  const result = await prisma.attendance_Session.updateMany({
    where: {
      status: {
        in: [
          AttendanceSessionStatus.NOT_STARTED,
          AttendanceSessionStatus.OPEN,
        ],
      },
      checkin_close_at: {
        lte: now,
      },
    },
    data: {
      status: AttendanceSessionStatus.CLOSED,
      closed_at: now,
    },
  });

  return {
    closed: result.count,
  };
};

export const updateAttendanceSessionStatuses = async () => {
  const now = new Date();
  const closed = await prisma.attendance_Session.updateMany({
    where: {
      status: {
        in: [
          AttendanceSessionStatus.NOT_STARTED,
          AttendanceSessionStatus.OPEN,
        ],
      },
      checkin_close_at: {
        lte: now,
      },
    },
    data: {
      status: AttendanceSessionStatus.CLOSED,
      closed_at: now,
    },
  });

  const opened = await prisma.attendance_Session.updateMany({
    where: {
      status: AttendanceSessionStatus.NOT_STARTED,
      checkin_open_at: {
        lte: now,
      },
      checkin_close_at: {
        gt: now,
      },
    },
    data: {
      status: AttendanceSessionStatus.OPEN,
      opened_at: now,
    },
  });

  return {
    opened: opened.count,
    closed: closed.count,
  };
};

const getAllAttendanceSessions = async (date?: Date | string) => {
  const sessionDate = toDateOnlyUtc(date ? new Date(date) : new Date());
  const sessions = await prisma.attendance_Session.findMany({
    where: {
      session_date: sessionDate,
    },
    orderBy: {
      checkin_open_at: 'asc',
    },
    include: {
      _count: {
        select: {
          attendanceRecords: true,
        },
      },
      course_schedule: {
        include: {
          course_class: {
            include: {
              subject: true,
              teacher: true,
              _count: {
                select: {
                  enrollments: true,
                },
              },
            },
          },
          room: true,
          start_shift: true,
          end_shift: true,
        },
      },
    },
  });

  return sessions.map((session) => {
    const schedule = session.course_schedule;
    const startShiftName = schedule.start_shift.name;
    const endShiftName = schedule.end_shift.name;
    const totalStudents = schedule.course_class._count.enrollments;
    const attendedCount = session._count.attendanceRecords;

    return {
      id: session.id_attendance_session,
      idAttendanceSession: session.id_attendance_session,
      status: session.status,
      sessionDate: session.session_date.toISOString().split('T')[0],
      checkinOpenAt: session.checkin_open_at.toISOString(),
      checkinCloseAt: session.checkin_close_at.toISOString(),
      openedAt: session.opened_at?.toISOString() ?? null,
      closedAt: session.closed_at?.toISOString() ?? null,
      isManual: session.is_manual,
      manualReason: session.manual_reason ?? null,
      cancelledAt: session.cancelled_at?.toISOString() ?? null,
      cancelReason: session.cancel_reason ?? null,
      subjectName: schedule.course_class.subject.name,
      courseCode: schedule.course_class.course_code,
      room: schedule.room.room_code,
      shift:
        startShiftName === endShiftName
          ? startShiftName
          : `${startShiftName} - ${endShiftName}`,
      teacherName: schedule.course_class.teacher.full_name,
      totalStudents,
      attendedCount,
      attendanceRate: getAttendanceRate(attendedCount, totalStudents),
    };
  });
};

function buildShiftLabel(startShiftName: string, endShiftName: string) {
  return startShiftName === endShiftName
    ? startShiftName
    : `${startShiftName} - ${endShiftName}`;
}

const cancelAttendanceSession = async (params: {
  attendanceSessionId: number;
  reason: string;
}) => {
  const session = await prisma.attendance_Session.findUnique({
    where: { id_attendance_session: params.attendanceSessionId },
    select: {
      id_attendance_session: true,
      status: true,
    },
  });

  if (!session) {
    return { error: 'NOT_FOUND' as const };
  }

  if (session.status === AttendanceSessionStatus.CLOSED) {
    return { error: 'ALREADY_CLOSED' as const };
  }

  if (session.status === AttendanceSessionStatus.CANCELLED) {
    return { error: 'ALREADY_CANCELLED' as const };
  }

  await prisma.attendance_Session.update({
    where: { id_attendance_session: params.attendanceSessionId },
    data: {
      status: AttendanceSessionStatus.CANCELLED,
      cancelled_at: new Date(),
      cancel_reason: params.reason,
    },
  });

  return { success: true as const };
};

const checkScheduleConflicts = async (params: {
  idCourseSchedule: number;
  sessionDate: string;
}) => {
  const schedule = await prisma.course_Schedule.findUnique({
    where: { id_course_schedule: params.idCourseSchedule },
    include: {
      start_shift: true,
      end_shift: true,
      room: true,
      course_class: {
        include: {
          subject: true,
          teacher: true,
        },
      },
    },
  });

  if (!schedule) {
    return { error: 'SCHEDULE_NOT_FOUND' as const };
  }

  const sessionDateUtc = new Date(`${params.sessionDate}T00:00:00.000Z`);
  const checkinOpenAt = combineDateAndTime(
    sessionDateUtc,
    schedule.start_shift.start_time,
  );
  const checkinCloseAt = combineDateAndTime(
    sessionDateUtc,
    schedule.end_shift.end_time,
  );

  // Check phiên đã tồn tại cho schedule + ngày này
  const existingSession = await prisma.attendance_Session.findUnique({
    where: {
      id_course_schedule_session_date: {
        id_course_schedule: params.idCourseSchedule,
        session_date: sessionDateUtc,
      },
    },
    select: { id_attendance_session: true },
  });

  // Check trùng phòng + giờ (overlap)
  const conflicts = await prisma.attendance_Session.findMany({
    where: {
      session_date: sessionDateUtc,
      status: {
        not: AttendanceSessionStatus.CANCELLED,
      },
      course_schedule: {
        id_room: schedule.id_room,
      },
      checkin_open_at: { lt: checkinCloseAt },
      checkin_close_at: { gt: checkinOpenAt },
    },
    include: {
      course_schedule: {
        include: {
          course_class: {
            include: {
              subject: true,
              teacher: true,
            },
          },
          start_shift: true,
          end_shift: true,
        },
      },
    },
  });

  return {
    hasExisting: !!existingSession,
    hasConflict: conflicts.length > 0,
    schedule: {
      idCourseSchedule: schedule.id_course_schedule,
      subjectName: schedule.course_class.subject.name,
      courseCode: schedule.course_class.course_code,
      teacherName: schedule.course_class.teacher.full_name,
      room: schedule.room.room_code,
      shift: buildShiftLabel(
        schedule.start_shift.name,
        schedule.end_shift.name,
      ),
    },
    conflicts: conflicts.map((c) => {
      const cs = c.course_schedule;
      return {
        subjectName: cs.course_class.subject.name,
        courseCode: cs.course_class.course_code,
        teacherName: cs.course_class.teacher.full_name,
        room: schedule.room.room_code,
        shift: buildShiftLabel(cs.start_shift.name, cs.end_shift.name),
        checkinOpenAt: c.checkin_open_at.toISOString(),
        checkinCloseAt: c.checkin_close_at.toISOString(),
      };
    }),
  };
};

const createManualAttendanceSession = async (params: {
  idCourseSchedule: number;
  sessionDate: string;
  reason?: string;
}) => {
  const schedule = await prisma.course_Schedule.findUnique({
    where: { id_course_schedule: params.idCourseSchedule },
    include: {
      start_shift: true,
      end_shift: true,
      room: true,
      course_class: {
        include: {
          subject: true,
          teacher: true,
        },
      },
    },
  });

  if (!schedule) {
    return { error: 'SCHEDULE_NOT_FOUND' as const };
  }

  const sessionDateUtc = new Date(`${params.sessionDate}T00:00:00.000Z`);
  const checkinOpenAt = combineDateAndTime(
    sessionDateUtc,
    schedule.start_shift.start_time,
  );
  const checkinCloseAt = combineDateAndTime(
    sessionDateUtc,
    schedule.end_shift.end_time,
  );

  // Check phiên đã tồn tại
  const existingSession = await prisma.attendance_Session.findUnique({
    where: {
      id_course_schedule_session_date: {
        id_course_schedule: params.idCourseSchedule,
        session_date: sessionDateUtc,
      },
    },
    select: { id_attendance_session: true },
  });

  if (existingSession) {
    return { error: 'ALREADY_EXISTS' as const };
  }

  // Check trùng phòng + giờ
  const conflicts = await prisma.attendance_Session.findMany({
    where: {
      session_date: sessionDateUtc,
      status: {
        not: AttendanceSessionStatus.CANCELLED,
      },
      course_schedule: {
        id_room: schedule.id_room,
      },
      checkin_open_at: { lt: checkinCloseAt },
      checkin_close_at: { gt: checkinOpenAt },
    },
    include: {
      course_schedule: {
        include: {
          course_class: {
            include: {
              subject: true,
              teacher: true,
            },
          },
          start_shift: true,
          end_shift: true,
        },
      },
    },
  });

  if (conflicts.length > 0) {
    return {
      error: 'SCHEDULE_CONFLICT' as const,
      conflicts: conflicts.map((c) => {
        const cs = c.course_schedule;
        return {
          subjectName: cs.course_class.subject.name,
          courseCode: cs.course_class.course_code,
          teacherName: cs.course_class.teacher.full_name,
          room: schedule.room.room_code,
          shift: buildShiftLabel(cs.start_shift.name, cs.end_shift.name),
          checkinOpenAt: c.checkin_open_at.toISOString(),
          checkinCloseAt: c.checkin_close_at.toISOString(),
        };
      }),
    };
  }

  // Tạo phiên mới
  const newSession = await prisma.attendance_Session.create({
    data: {
      id_course_schedule: schedule.id_course_schedule,
      session_date: sessionDateUtc,
      status: AttendanceSessionStatus.NOT_STARTED,
      checkin_open_at: checkinOpenAt,
      checkin_close_at: checkinCloseAt,
      is_manual: true,
      manual_reason: params.reason ?? null,
    },
  });

  return {
    success: true as const,
    session: {
      idAttendanceSession: newSession.id_attendance_session,
      sessionDate: newSession.session_date.toISOString().split('T')[0],
      status: newSession.status,
      checkinOpenAt: newSession.checkin_open_at.toISOString(),
      checkinCloseAt: newSession.checkin_close_at.toISOString(),
      isManual: newSession.is_manual,
      subjectName: schedule.course_class.subject.name,
      courseCode: schedule.course_class.course_code,
      room: schedule.room.room_code,
      shift: buildShiftLabel(
        schedule.start_shift.name,
        schedule.end_shift.name,
      ),
      teacherName: schedule.course_class.teacher.full_name,
    },
  };
};

const getAllCourseSchedules = async () => {
  const schedules = await prisma.course_Schedule.findMany({
    include: {
      course_class: {
        include: {
          subject: true,
          teacher: true,
        },
      },
      room: true,
      start_shift: true,
      end_shift: true,
    },
    orderBy: [
      { course_class: { course_code: 'asc' } },
      { day_of_week: 'asc' },
    ],
  });

  return schedules.map((s) => ({
    idCourseSchedule: s.id_course_schedule,
    courseCode: s.course_class.course_code,
    subjectName: s.course_class.subject.name,
    subjectCode: s.course_class.subject.subject_code,
    teacherName: s.course_class.teacher.full_name,
    dayOfWeek: s.day_of_week,
    room: s.room.room_code,
    shift: buildShiftLabel(s.start_shift.name, s.end_shift.name),
    startDate: s.start_date.toISOString().split('T')[0],
    endDate: s.end_date.toISOString().split('T')[0],
  }));
};

export const AttendanceSessionService = {
  getAllAttendanceSessions,
  cancelAttendanceSession,
  checkScheduleConflicts,
  createManualAttendanceSession,
  getAllCourseSchedules,
};
