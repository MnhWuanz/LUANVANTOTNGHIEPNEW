import {
  AttendanceRecordStatus,
  AttendanceSessionStatus,
  KioskStatus,
} from '@prisma/client';
import { prisma } from 'config/client';

const APP_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const KIOSK_ONLINE_THRESHOLD_MINUTES = 5;

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

function formatDateOnly(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function getCount<T extends string>(
  rows: { status: T; _count: { _all: number } }[],
  status: T,
) {
  return rows.find((row) => row.status === status)?._count._all ?? 0;
}

function getAttendanceRate(attended: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((attended / total) * 100);
}

function buildShiftLabel(startShiftName: string, endShiftName: string) {
  return startShiftName === endShiftName
    ? startShiftName
    : `${startShiftName} - ${endShiftName}`;
}

const getDashboard = async () => {
  const now = new Date();
  const today = toDateOnlyUtc(now);
  const onlineAfter = new Date(
    now.getTime() - KIOSK_ONLINE_THRESHOLD_MINUTES * 60 * 1000,
  );

  const [
    sessionStatusRows,
    todaySessions,
    attendanceStatusRows,
    roomsWithoutKiosk,
    kioskStatusRows,
    kioskItems,
    openSessionsNoAttendance,
    studentsMissingFace,
    latestSyncBatch,
    latestAttendanceRecords,
    latestKiosks,
    latestSyncBatches,
  ] = await Promise.all([
    prisma.attendance_Session.groupBy({
      by: ['status'],
      where: { session_date: today },
      _count: { _all: true },
    }),
    prisma.attendance_Session.findMany({
      where: { session_date: today },
      orderBy: { checkin_open_at: 'asc' },
      include: {
        _count: {
          select: { attendanceRecords: true },
        },
        course_schedule: {
          include: {
            room: true,
            start_shift: true,
            end_shift: true,
            course_class: {
              include: {
                subject: true,
                teacher: true,
                _count: {
                  select: { enrollments: true },
                },
              },
            },
          },
        },
      },
    }),
    prisma.attendance_Record.groupBy({
      by: ['status'],
      where: {
        attendance_session: {
          session_date: today,
        },
      },
      _count: { _all: true },
    }),
    prisma.room.count({
      where: {
        kiosk: {
          is: null,
        },
      },
    }),
    prisma.kiosk.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.kiosk.findMany({
      orderBy: [{ status: 'asc' }, { last_seen_at: 'desc' }],
      take: 8,
      include: {
        room: true,
      },
    }),
    prisma.attendance_Session.count({
      where: {
        session_date: today,
        status: AttendanceSessionStatus.OPEN,
        attendanceRecords: {
          none: {},
        },
      },
    }),
    prisma.student.count({
      where: { is_face_registered: false },
    }),
    prisma.sync_Batch.findFirst({
      orderBy: { synced_at: 'desc' },
    }),
    prisma.attendance_Record.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        student: {
          select: {
            student_code: true,
            full_name: true,
          },
        },
        attendance_session: {
          include: {
            course_schedule: {
              include: {
                room: true,
                course_class: {
                  include: {
                    subject: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.kiosk.findMany({
      take: 5,
      orderBy: { updated_at: 'desc' },
      include: {
        room: true,
      },
    }),
    prisma.sync_Batch.findMany({
      take: 3,
      orderBy: { synced_at: 'desc' },
    }),
  ]);

  const totalSessionsToday = todaySessions.length;
  const openSessions = getCount(sessionStatusRows, AttendanceSessionStatus.OPEN);
  const closedSessions = getCount(
    sessionStatusRows,
    AttendanceSessionStatus.CLOSED,
  );
  const notStartedSessions = getCount(
    sessionStatusRows,
    AttendanceSessionStatus.NOT_STARTED,
  );

  const presentRecords = getCount(
    attendanceStatusRows,
    AttendanceRecordStatus.PRESENT,
  );
  const lateRecords = getCount(attendanceStatusRows, AttendanceRecordStatus.LATE);
  const absentRecords = getCount(
    attendanceStatusRows,
    AttendanceRecordStatus.ABSENT,
  );
  const totalAttendanceRecords = presentRecords + lateRecords + absentRecords;

  const expectedAttendanceSlots = todaySessions.reduce(
    (total, session) =>
      total + session.course_schedule.course_class._count.enrollments,
    0,
  );
  const attendedRecords = presentRecords + lateRecords;
  const attendanceRate = getAttendanceRate(
    attendedRecords,
    expectedAttendanceSlots,
  );

  const totalKiosks = kioskStatusRows.reduce(
    (total, row) => total + row._count._all,
    0,
  );
  const pendingKiosks = getCount(kioskStatusRows, KioskStatus.PENDING);
  const activeKiosks = getCount(kioskStatusRows, KioskStatus.ACTIVE);
  const inactiveKiosks = getCount(kioskStatusRows, KioskStatus.INACTIVE);
  const blockedKiosks = getCount(kioskStatusRows, KioskStatus.BLOCKED);
  const onlineKiosks = kioskItems.filter(
    (item) =>
      item.status === KioskStatus.ACTIVE &&
      item.is_active &&
      item.last_seen_at &&
      item.last_seen_at >= onlineAfter,
  ).length;
  const offlineKiosks = kioskItems.filter(
    (item) =>
      item.status === KioskStatus.ACTIVE &&
      item.is_active &&
      (!item.last_seen_at || item.last_seen_at < onlineAfter),
  ).length;

  const alertItems = [
    roomsWithoutKiosk > 0
      ? {
          key: 'rooms-without-kiosk',
          severity: 'warning',
          title: 'Phòng học chưa có Kiosk',
          message: `${roomsWithoutKiosk} phòng học chưa được gắn thiết bị`,
          count: roomsWithoutKiosk,
        }
      : null,
    pendingKiosks > 0
      ? {
          key: 'pending-kiosks',
          severity: 'warning',
          title: 'Kiosk chờ kích hoạt',
          message: `${pendingKiosks} thiết bị đã tạo nhưng chưa kích hoạt`,
          count: pendingKiosks,
        }
      : null,
    offlineKiosks > 0
      ? {
          key: 'offline-kiosks',
          severity: 'error',
          title: 'Kiosk có thể đang offline',
          message: `${offlineKiosks} thiết bị ACTIVE không gửi heartbeat trong ${KIOSK_ONLINE_THRESHOLD_MINUTES} phút`,
          count: offlineKiosks,
        }
      : null,
    openSessionsNoAttendance > 0
      ? {
          key: 'open-sessions-no-attendance',
          severity: 'error',
          title: 'Buổi đang mở chưa có điểm danh',
          message: `${openSessionsNoAttendance} buổi đang mở nhưng chưa ghi nhận lượt điểm danh`,
          count: openSessionsNoAttendance,
        }
      : null,
    studentsMissingFace > 0
      ? {
          key: 'students-missing-face',
          severity: 'info',
          title: 'Sinh viên chưa đăng ký khuôn mặt',
          message: `${studentsMissingFace} sinh viên chưa sẵn sàng điểm danh khuôn mặt`,
          count: studentsMissingFace,
        }
      : null,
    !latestSyncBatch
      ? {
          key: 'missing-sync',
          severity: 'warning',
          title: 'Chưa có lịch sử đồng bộ',
          message: 'Hệ thống chưa ghi nhận lần sync dữ liệu đào tạo nào',
          count: 1,
        }
      : null,
  ].filter(Boolean);

  const recentActivities = [
    ...latestAttendanceRecords.map((record) => ({
      key: `attendance-${record.id_attendance_record}`,
      type: 'ATTENDANCE',
      title: 'Điểm danh mới',
      message: `${record.student.full_name} (${record.student.student_code}) - ${record.status}`,
      date: record.created_at,
      meta: record.attendance_session.course_schedule.room.room_code,
    })),
    ...latestKiosks.map((kiosk) => ({
      key: `kiosk-${kiosk.id_kiosk}`,
      type: 'KIOSK',
      title: 'Cập nhật Kiosk',
      message: `${kiosk.device_name} - ${kiosk.status}`,
      date: kiosk.updated_at,
      meta: kiosk.room.room_code,
    })),
    ...latestSyncBatches.map((batch) => ({
      key: `sync-${batch.id_sync_batch}`,
      type: 'SYNC',
      title: 'Đồng bộ dữ liệu',
      message: `${batch.total_records} bản ghi, tạo mới ${batch.total_created}, cập nhật ${batch.total_updated}`,
      date: batch.synced_at,
      meta: 'Sync',
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8)
    .map((item) => ({
      ...item,
      date: item.date.toISOString(),
    }));

  return {
    generatedAt: now.toISOString(),
    today: formatDateOnly(now),
    notes: [
      `Kiosk online được tính theo last_seen_at trong ${KIOSK_ONLINE_THRESHOLD_MINUTES} phút gần nhất`,
      'Tỷ lệ điểm danh = (PRESENT + LATE) / tổng sinh viên trong các buổi hôm nay',
    ],
    statData: [
      {
        key: 'sessions-today',
        title: 'Buổi hôm nay',
        value: String(totalSessionsToday),
        extra: `${openSessions} đang mở, ${closedSessions} đã đóng`,
        tone: 'blue',
      },
      {
        key: 'attendance-rate',
        title: 'Tỷ lệ điểm danh',
        value: `${attendanceRate}%`,
        extra: `${attendedRecords}/${expectedAttendanceSlots} lượt dự kiến`,
        tone: 'green',
      },
      {
        key: 'kiosk-online',
        title: 'Kiosk online',
        value: String(onlineKiosks),
        extra: `${offlineKiosks} offline, ${pendingKiosks} chờ kích hoạt`,
        tone: offlineKiosks > 0 ? 'red' : 'cyan',
      },
      {
        key: 'system-alerts',
        title: 'Cảnh báo',
        value: String(alertItems.length),
        extra:
          alertItems.length > 0 ? 'Cần kiểm tra trong hôm nay' : 'Không có cảnh báo',
        tone: alertItems.length > 0 ? 'gold' : 'green',
      },
    ],
    sessionStatusSummary: {
      total: totalSessionsToday,
      notStarted: notStartedSessions,
      open: openSessions,
      closed: closedSessions,
    },
    attendanceSummary: {
      totalRecords: totalAttendanceRecords,
      expectedAttendanceSlots,
      attendedRecords,
      present: presentRecords,
      late: lateRecords,
      absent: absentRecords,
      attendanceRate,
    },
    kioskHealth: {
      total: totalKiosks,
      active: activeKiosks,
      pending: pendingKiosks,
      inactive: inactiveKiosks,
      blocked: blockedKiosks,
      online: onlineKiosks,
      offline: offlineKiosks,
      onlineThresholdMinutes: KIOSK_ONLINE_THRESHOLD_MINUTES,
      items: kioskItems.map((kiosk) => ({
        id: kiosk.id_kiosk,
        deviceCode: kiosk.device_code,
        deviceName: kiosk.device_name,
        roomCode: kiosk.room.room_code,
        status: kiosk.status,
        isActive: kiosk.is_active,
        lastSeenAt: kiosk.last_seen_at?.toISOString() ?? null,
        online:
          kiosk.status === KioskStatus.ACTIVE &&
          kiosk.is_active &&
          kiosk.last_seen_at !== null &&
          kiosk.last_seen_at >= onlineAfter,
      })),
    },
    todaySessions: todaySessions.map((session) => {
      const schedule = session.course_schedule;
      const totalStudents = schedule.course_class._count.enrollments;
      const attendedCount = session._count.attendanceRecords;

      return {
        id: session.id_attendance_session,
        courseCode: schedule.course_class.course_code,
        subjectName: schedule.course_class.subject.name,
        teacherName: schedule.course_class.teacher.full_name,
        roomCode: schedule.room.room_code,
        shift: buildShiftLabel(schedule.start_shift.name, schedule.end_shift.name),
        status: session.status,
        checkinOpenAt: session.checkin_open_at.toISOString(),
        checkinCloseAt: session.checkin_close_at.toISOString(),
        attendedCount,
        totalStudents,
        attendanceRate: getAttendanceRate(attendedCount, totalStudents),
      };
    }),
    alerts: alertItems,
    recentActivities,
    sync: latestSyncBatch
      ? {
          latestSyncedAt: latestSyncBatch.synced_at.toISOString(),
          totalRecords: latestSyncBatch.total_records,
          totalCreated: latestSyncBatch.total_created,
          totalUpdated: latestSyncBatch.total_updated,
        }
      : null,
  };
};

export const DashboardService = {
  getDashboard,
};
