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

//Task: Tạo buổi điểm danh cho tất cả các lịch học trong ngày hôm nay
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
  if (schedules.length != 0) {
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
  }
  return {
    date: sessionDate.toISOString().split('T')[0],
    totalSchedules: schedules.length,
    created,
    existed,
  };
};
//Task: Đóng tất cả các buổi điểm danh đã hết hạn
export const closeExpiredAttendanceSessions = async () => {
  const now = new Date();
  const result = await prisma.attendance_Session.updateMany({
    where: {
      status: {
        not: AttendanceSessionStatus.CLOSED,
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
//Task: Cập nhật trạng thái của tất cả các buổi điểm danh
export const updateAttendanceSessionStatuses = async () => {
  const now = new Date();
  const closed = await prisma.attendance_Session.updateMany({
    where: {
      status: {
        not: AttendanceSessionStatus.CLOSED,
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
    select: {
      status: true,
      course_schedule: {
        select: {
          course_class: {
            select: {
              course_code: true,
              subject: {
                select: {
                  name: true,
                },
              },
              teacher: {
                select: {
                  full_name: true,
                },
              },
            },
          },
          room: {
            select: {
              room_code: true,
            },
          },
          start_shift: {
            select: {
              name: true,
            },
          },
          end_shift: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return sessions.map((session) => {
    const schedule = session.course_schedule;
    const startShiftName = schedule.start_shift.name;
    const endShiftName = schedule.end_shift.name;

    return {
      status: session.status,
      subjectName: schedule.course_class.subject.name,
      courseCode: schedule.course_class.course_code,
      room: schedule.room.room_code,
      shift:
        startShiftName === endShiftName
          ? startShiftName
          : `${startShiftName} - ${endShiftName}`,
      teacherName: schedule.course_class.teacher.full_name,
    };
  });
};
export const AttendanceSessionService = {
  getAllAttendanceSessions,
};
