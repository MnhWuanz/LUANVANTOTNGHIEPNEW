import {
  AttendanceRecordStatus,
  AttendanceSessionStatus,
} from '@prisma/client';
import { prisma } from 'config/client';

const APP_TIME_ZONE = 'Asia/Ho_Chi_Minh';

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

function getAttendanceRate(attended: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((attended / total) * 100);
}

function buildShiftLabel(startShiftName: string, endShiftName: string) {
  return startShiftName === endShiftName
    ? startShiftName
    : `${startShiftName} - ${endShiftName}`;
}

const getTeacherDashboard = async (teacherUserId: number) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id_user: teacherUserId },
    select: {
      id_teacher: true,
      full_name: true,
      teacher_code: true,
    },
  });

  if (!teacher) {
    return null;
  }

  const now = new Date();
  const today = toDateOnlyUtc(now);

  // ============ PARALLEL QUERIES ============
  const [
    courseClasses,
    todaySessions,
    allStudents,
  ] = await Promise.all([
    // 1) Lớp học phần của giảng viên + đếm sinh viên
    prisma.course_Class.findMany({
      where: { id_teacher: teacher.id_teacher },
      select: {
        id_course_class: true,
        course_code: true,
        subject: {
          select: { name: true, subject_code: true },
        },
        _count: {
          select: { enrollments: true },
        },
        enrollments: {
          select: {
            student: {
              select: {
                id_student: true,
                student_code: true,
                full_name: true,
                class: true,
                is_face_registered: true,
              },
            },
          },
        },
      },
      orderBy: { course_code: 'asc' },
    }),

    // 2) Buổi điểm danh hôm nay của giảng viên
    prisma.attendance_Session.findMany({
      where: {
        session_date: today,
        course_schedule: {
          course_class: {
            id_teacher: teacher.id_teacher,
          },
        },
      },
      orderBy: { checkin_open_at: 'asc' },
      include: {
        _count: {
          select: { attendanceRecords: true },
        },
        attendanceRecords: {
          select: { status: true },
        },
        course_schedule: {
          include: {
            room: true,
            start_shift: true,
            end_shift: true,
            course_class: {
              include: {
                subject: true,
                _count: {
                  select: { enrollments: true },
                },
              },
            },
          },
        },
      },
    }),

    // 3) Tất cả sinh viên chưa đăng ký khuôn mặt trong các lớp của GV
    prisma.enrollment.findMany({
      where: {
        course_class: {
          id_teacher: teacher.id_teacher,
        },
        student: {
          is_face_registered: false,
        },
      },
      select: {
        student: {
          select: {
            id_student: true,
            student_code: true,
            full_name: true,
            class: true,
          },
        },
        course_class: {
          select: {
            course_code: true,
            subject: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: {
        student: { student_code: 'asc' },
      },
    }),
  ]);

  // ============ PROCESS DATA ============

  // Stat: Lớp học phần
  const totalCourseClasses = courseClasses.length;

  // Stat: Tổng sinh viên (deduplicate vì 1 SV có thể trong nhiều lớp)
  const uniqueStudentIds = new Set<number>();
  const uniqueRegisteredIds = new Set<number>();

  for (const cc of courseClasses) {
    for (const e of cc.enrollments) {
      uniqueStudentIds.add(e.student.id_student);
      if (e.student.is_face_registered) {
        uniqueRegisteredIds.add(e.student.id_student);
      }
    }
  }

  const totalStudents = uniqueStudentIds.size;
  const totalFaceRegistered = uniqueRegisteredIds.size;
  const totalFaceNotRegistered = totalStudents - totalFaceRegistered;
  const faceRegistrationRate = getAttendanceRate(totalFaceRegistered, totalStudents);

  // Stat: Buổi hôm nay
  const totalSessionsToday = todaySessions.length;
  const openSessions = todaySessions.filter(
    (s) => s.status === AttendanceSessionStatus.OPEN,
  ).length;
  const closedSessions = todaySessions.filter(
    (s) => s.status === AttendanceSessionStatus.CLOSED,
  ).length;

  // Tổng điểm danh hôm nay
  let totalPresent = 0;
  let totalLate = 0;
  let totalAbsent = 0;
  let totalExpected = 0;

  for (const session of todaySessions) {
    totalExpected += session.course_schedule.course_class._count.enrollments;
    for (const record of session.attendanceRecords) {
      if (record.status === AttendanceRecordStatus.PRESENT) totalPresent++;
      else if (record.status === AttendanceRecordStatus.LATE) totalLate++;
      else if (record.status === AttendanceRecordStatus.ABSENT) totalAbsent++;
    }
  }

  const attendedRecords = totalPresent + totalLate;
  const attendanceRate = getAttendanceRate(attendedRecords, totalExpected);

  // Tổng quan đăng ký khuôn mặt theo lớp
  const faceRegistrationByClass = courseClasses.map((cc) => {
    const registered = cc.enrollments.filter(
      (e) => e.student.is_face_registered,
    ).length;
    const total = cc._count.enrollments;

    return {
      courseCode: cc.course_code,
      subjectName: cc.subject.name,
      registered,
      total,
      rate: getAttendanceRate(registered, total),
    };
  });

  // Sinh viên chưa đăng ký khuôn mặt (deduplicate, take 10)
  const seenStudentIds = new Set<number>();
  const unregisteredStudents = allStudents
    .filter((e) => {
      if (seenStudentIds.has(e.student.id_student)) return false;
      seenStudentIds.add(e.student.id_student);
      return true;
    })
    .slice(0, 10)
    .map((e) => ({
      id_student: e.student.id_student,
      student_code: e.student.student_code,
      full_name: e.student.full_name,
      class: e.student.class,
      course_code: e.course_class.course_code,
      subject_name: e.course_class.subject.name,
    }));

  // Buổi hôm nay
  const todaySessionItems = todaySessions.map((session) => {
    const schedule = session.course_schedule;
    const totalStudentsInSession = schedule.course_class._count.enrollments;
    const attendedCount = session._count.attendanceRecords;

    return {
      id: session.id_attendance_session,
      courseCode: schedule.course_class.course_code,
      subjectName: schedule.course_class.subject.name,
      roomCode: schedule.room.room_code,
      shift: buildShiftLabel(
        schedule.start_shift.name,
        schedule.end_shift.name,
      ),
      status: session.status,
      checkinOpenAt: session.checkin_open_at.toISOString(),
      checkinCloseAt: session.checkin_close_at.toISOString(),
      attendedCount,
      totalStudents: totalStudentsInSession,
      attendanceRate: getAttendanceRate(attendedCount, totalStudentsInSession),
    };
  });

  return {
    generatedAt: now.toISOString(),
    today: formatDateOnly(now),
    teacher: {
      fullName: teacher.full_name,
      teacherCode: teacher.teacher_code,
    },
    statData: [
      {
        key: 'course-classes',
        title: 'Lớp học phần',
        value: String(totalCourseClasses),
        extra: `Đang phụ trách ${totalCourseClasses} lớp`,
        tone: 'blue',
      },
      {
        key: 'total-students',
        title: 'Tổng sinh viên',
        value: String(totalStudents),
        extra: `Trong ${totalCourseClasses} lớp học phần`,
        tone: 'cyan',
      },
      {
        key: 'face-registration',
        title: 'Đăng ký khuôn mặt',
        value: `${faceRegistrationRate}%`,
        extra: `${totalFaceRegistered}/${totalStudents} sinh viên`,
        tone: totalFaceNotRegistered > 0 ? 'gold' : 'green',
      },
      {
        key: 'sessions-today',
        title: 'Buổi hôm nay',
        value: String(totalSessionsToday),
        extra:
          totalSessionsToday > 0
            ? `${openSessions} đang mở, ${closedSessions} đã đóng`
            : 'Không có buổi nào',
        tone: openSessions > 0 ? 'green' : 'blue',
      },
    ],
    attendanceSummary: {
      present: totalPresent,
      late: totalLate,
      absent: totalAbsent,
      attendedRecords,
      expectedSlots: totalExpected,
      attendanceRate,
    },
    faceRegistrationSummary: {
      totalStudents,
      registered: totalFaceRegistered,
      notRegistered: totalFaceNotRegistered,
      rate: faceRegistrationRate,
      byClass: faceRegistrationByClass,
    },
    todaySessions: todaySessionItems,
    unregisteredStudents,
  };
};

export const TeacherDashboardService = {
  getTeacherDashboard,
};
