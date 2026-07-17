import {
  AttendanceRecordStatus,
  AttendanceSessionStatus,
} from '@prisma/client';
import { prisma } from 'config/client';

const APP_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const dayOfWeekLabel: Record<number, string> = {
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
  7: 'Chủ nhật',
};

function formatDateOnly(date: Date) {
  return date.toISOString().split('T')[0];
}

function formatTimeOnly(time: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(time);
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

function buildAttendanceSummary(
  records: {
    id_student: number;
    status: AttendanceRecordStatus;
  }[],
  totalStudents: number,
  sessionStatus: AttendanceSessionStatus,
) {
  const studentIdsWithRecord = new Set<number>();
  let present = 0;
  let late = 0;
  let recordedAbsent = 0;

  for (const record of records) {
    studentIdsWithRecord.add(record.id_student);

    if (record.status === AttendanceRecordStatus.PRESENT) {
      present++;
      continue;
    }

    if (record.status === AttendanceRecordStatus.LATE) {
      late++;
      continue;
    }

    if (record.status === AttendanceRecordStatus.ABSENT) {
      recordedAbsent++;
    }
  }

  const missing = Math.max(totalStudents - studentIdsWithRecord.size, 0);
  const inferredAbsent =
    sessionStatus === AttendanceSessionStatus.CLOSED ? missing : 0;
  const pending =
    sessionStatus === AttendanceSessionStatus.CLOSED ? 0 : missing;
  const attended = present + late;

  return {
    totalStudents,
    present,
    late,
    absent: recordedAbsent + inferredAbsent,
    pending,
    attended,
    attendanceRate: getAttendanceRate(attended, totalStudents),
  };
}

function getEffectiveAttendanceStatus(params: {
  recordStatus?: AttendanceRecordStatus | null;
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

async function getTeacherIdByUserId(teacherUserId: number) {
  const teacher = await prisma.teacher.findUnique({
    where: { id_user: teacherUserId },
    select: { id_teacher: true },
  });

  return teacher?.id_teacher ?? null;
}

const getCourseClassesByTeacherUserId = async (teacherUserId: number) => {
  const teacherId = await getTeacherIdByUserId(teacherUserId);

  if (!teacherId) {
    return [];
  }

  const courseClasses = await prisma.course_Class.findMany({
    where: { id_teacher: teacherId },
    select: {
      id_course_class: true,
      course_code: true,
      subject: {
        select: {
          name: true,
          subject_code: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
    orderBy: { course_code: 'asc' },
  });

  return courseClasses.map((cc) => ({
    id_course_class: cc.id_course_class,
    course_code: cc.course_code,
    subject_name: cc.subject.name,
    subject_code: cc.subject.subject_code,
    total_students: cc._count.enrollments,
  }));
};

const getCourseClassSchedules = async (
  courseClassId: number,
  teacherUserId: number,
) => {
  const teacherId = await getTeacherIdByUserId(teacherUserId);

  if (!teacherId) {
    return null;
  }

  const courseClass = await prisma.course_Class.findFirst({
    where: {
      id_course_class: courseClassId,
      id_teacher: teacherId,
    },
    select: {
      id_course_class: true,
      course_code: true,
      subject: {
        select: {
          subject_code: true,
          name: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
      courseSchedules: {
        select: {
          id_course_schedule: true,
          day_of_week: true,
          start_date: true,
          end_date: true,
          room: {
            select: {
              id_room: true,
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
          attendanceSession: {
            select: {
              id_attendance_session: true,
              session_date: true,
              status: true,
              checkin_open_at: true,
              checkin_close_at: true,
              opened_at: true,
              closed_at: true,
              attendanceRecords: {
                select: {
                  id_student: true,
                  status: true,
                },
              },
            },
            orderBy: [{ session_date: 'asc' }, { checkin_open_at: 'asc' }],
          },
        },
        orderBy: [{ day_of_week: 'asc' }, { start_date: 'asc' }],
      },
    },
  });

  if (!courseClass) {
    return null;
  }

  const totalStudents = courseClass._count.enrollments;
  let totalSessions = 0;
  let totalExpectedSlots = 0;
  let totalAttended = 0;

  const schedules = courseClass.courseSchedules.map((schedule) => {
    const sessions = schedule.attendanceSession.map((session) => {
      const summary = buildAttendanceSummary(
        session.attendanceRecords,
        totalStudents,
        session.status,
      );

      totalSessions++;
      totalExpectedSlots += totalStudents;
      totalAttended += summary.attended;

      return {
        idAttendanceSession: session.id_attendance_session,
        sessionDate: formatDateOnly(session.session_date),
        status: session.status,
        checkinOpenAt: session.checkin_open_at.toISOString(),
        checkinCloseAt: session.checkin_close_at.toISOString(),
        openedAt: session.opened_at?.toISOString() ?? null,
        closedAt: session.closed_at?.toISOString() ?? null,
        ...summary,
      };
    });

    return {
      idCourseSchedule: schedule.id_course_schedule,
      dayOfWeek: schedule.day_of_week,
      dayOfWeekLabel:
        dayOfWeekLabel[schedule.day_of_week] ?? `Thứ ${schedule.day_of_week}`,
      startDate: formatDateOnly(schedule.start_date),
      endDate: formatDateOnly(schedule.end_date),
      room: {
        idRoom: schedule.room.id_room,
        roomCode: schedule.room.room_code,
      },
      shift: buildShiftLabel(schedule.start_shift.name, schedule.end_shift.name),
      startShift: {
        name: schedule.start_shift.name,
        startTime: formatTimeOnly(schedule.start_shift.start_time),
      },
      endShift: {
        name: schedule.end_shift.name,
        endTime: formatTimeOnly(schedule.end_shift.end_time),
      },
      sessions,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    timeZone: APP_TIME_ZONE,
    courseClass: {
      idCourseClass: courseClass.id_course_class,
      courseCode: courseClass.course_code,
      subjectCode: courseClass.subject.subject_code,
      subjectName: courseClass.subject.name,
      totalStudents,
    },
    summary: {
      totalSchedules: schedules.length,
      totalSessions,
      totalStudents,
      attendedSlots: totalAttended,
      expectedSlots: totalExpectedSlots,
      averageAttendanceRate: getAttendanceRate(
        totalAttended,
        totalExpectedSlots,
      ),
    },
    schedules,
  };
};

const getStudentsByCourseClassId = async (
  courseClassId: number,
  teacherUserId: number,
) => {
  const teacherId = await getTeacherIdByUserId(teacherUserId);

  if (!teacherId) {
    return null;
  }

  const courseClass = await prisma.course_Class.findFirst({
    where: {
      id_course_class: courseClassId,
      id_teacher: teacherId,
    },
    select: { id_course_class: true },
  });

  if (!courseClass) {
    return null;
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { id_course_class: courseClassId },
    select: {
      student: {
        select: {
          id_student: true,
          student_code: true,
          full_name: true,
          email: true,
          class: true,
          is_face_registered: true,
          faceEnrollments: {
            where: { status: 'ACTIVE' },
            select: {
              id_face_enrollment: true,
              enrolled_at: true,
              quality_score: true,
            },
            take: 1,
            orderBy: { enrolled_at: 'desc' },
          },
        },
      },
    },
    orderBy: { student: { student_code: 'asc' } },
  });

  return enrollments.map((e) => {
    const activeFace = e.student.faceEnrollments[0] || null;

    return {
      id_student: e.student.id_student,
      student_code: e.student.student_code,
      full_name: e.student.full_name,
      email: e.student.email,
      class: e.student.class,
      is_face_registered: e.student.is_face_registered,
      active_face_enrollment: activeFace
        ? {
            id_face_enrollment: activeFace.id_face_enrollment,
            enrolled_at: activeFace.enrolled_at,
            quality_score: activeFace.quality_score,
          }
        : null,
    };
  });
};

const getAttendanceSessionStudents = async (
  attendanceSessionId: number,
  teacherUserId: number,
) => {
  const teacherId = await getTeacherIdByUserId(teacherUserId);

  if (!teacherId) {
    return null;
  }

  const session = await prisma.attendance_Session.findFirst({
    where: {
      id_attendance_session: attendanceSessionId,
      course_schedule: {
        course_class: {
          id_teacher: teacherId,
        },
      },
    },
    select: {
      id_attendance_session: true,
      session_date: true,
      status: true,
      checkin_open_at: true,
      checkin_close_at: true,
      opened_at: true,
      closed_at: true,
      course_schedule: {
        select: {
          id_course_schedule: true,
          day_of_week: true,
          room: {
            select: {
              id_room: true,
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
              course_code: true,
              subject: {
                select: {
                  subject_code: true,
                  name: true,
                },
              },
              enrollments: {
                select: {
                  student: {
                    select: {
                      id_student: true,
                      student_code: true,
                      full_name: true,
                      email: true,
                      class: true,
                    },
                  },
                },
                orderBy: {
                  student: {
                    student_code: 'asc',
                  },
                },
              },
            },
          },
        },
      },
      attendanceRecords: {
        select: {
          id_attendance_record: true,
          id_student: true,
          status: true,
          confidence: true,
          checkin_time: true,
          created_at: true,
          note: true,
          is_manual_update: true,
          updated_at: true,
          kiosk: {
            select: {
              id_kiosk: true,
              device_code: true,
              device_name: true,
              room: {
                select: {
                  room_code: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  const schedule = session.course_schedule;
  const courseClass = schedule.course_class;
  type SessionAttendanceRecord = (typeof session.attendanceRecords)[number];
  const recordsByStudentId = new Map<number, SessionAttendanceRecord>(
    session.attendanceRecords.map((record) => [
      record.id_student,
      record,
    ] as [number, SessionAttendanceRecord]),
  );

  let present = 0;
  let late = 0;
  let absent = 0;
  let pending = 0;

  const students = courseClass.enrollments.map((enrollment) => {
    const record = recordsByStudentId.get(enrollment.student.id_student);
    const effectiveAttendanceStatus = getEffectiveAttendanceStatus({
      recordStatus: record?.status ?? null,
      sessionStatus: session.status,
    });

    if (effectiveAttendanceStatus === AttendanceRecordStatus.PRESENT) {
      present++;
    } else if (effectiveAttendanceStatus === AttendanceRecordStatus.LATE) {
      late++;
    } else if (effectiveAttendanceStatus === AttendanceRecordStatus.ABSENT) {
      absent++;
    } else {
      pending++;
    }

    return {
      idStudent: enrollment.student.id_student,
      studentCode: enrollment.student.student_code,
      fullName: enrollment.student.full_name,
      email: enrollment.student.email,
      class: enrollment.student.class,
      effectiveAttendanceStatus,
      recordStatus: record?.status ?? null,
      inferredAbsent:
        !record &&
        effectiveAttendanceStatus === AttendanceRecordStatus.ABSENT,
      idAttendanceRecord: record?.id_attendance_record ?? null,
      checkinTime: record?.checkin_time?.toISOString() ?? null,
      confidence: record?.confidence ?? null,
      createdAt: record?.created_at.toISOString() ?? null,
      note: record?.note ?? null,
      isManualUpdate: record?.is_manual_update ?? false,
      updatedAt: record?.updated_at?.toISOString() ?? null,
      kiosk: record?.kiosk
        ? {
            idKiosk: record.kiosk.id_kiosk,
            deviceCode: record.kiosk.device_code,
            deviceName: record.kiosk.device_name,
            roomCode: record.kiosk.room?.room_code ?? null,
          }
        : null,
    };
  });

  const attended = present + late;
  const totalStudents = students.length;

  return {
    generatedAt: new Date().toISOString(),
    timeZone: APP_TIME_ZONE,
    session: {
      idAttendanceSession: session.id_attendance_session,
      idCourseSchedule: schedule.id_course_schedule,
      sessionDate: formatDateOnly(session.session_date),
      status: session.status,
      checkinOpenAt: session.checkin_open_at.toISOString(),
      checkinCloseAt: session.checkin_close_at.toISOString(),
      openedAt: session.opened_at?.toISOString() ?? null,
      closedAt: session.closed_at?.toISOString() ?? null,
      dayOfWeek: schedule.day_of_week,
      dayOfWeekLabel:
        dayOfWeekLabel[schedule.day_of_week] ?? `Thứ ${schedule.day_of_week}`,
      room: {
        idRoom: schedule.room.id_room,
        roomCode: schedule.room.room_code,
      },
      shift: buildShiftLabel(schedule.start_shift.name, schedule.end_shift.name),
      startShift: {
        name: schedule.start_shift.name,
        startTime: formatTimeOnly(schedule.start_shift.start_time),
      },
      endShift: {
        name: schedule.end_shift.name,
        endTime: formatTimeOnly(schedule.end_shift.end_time),
      },
      courseClass: {
        idCourseClass: courseClass.id_course_class,
        courseCode: courseClass.course_code,
        subjectCode: courseClass.subject.subject_code,
        subjectName: courseClass.subject.name,
      },
    },
    summary: {
      totalStudents,
      present,
      late,
      absent,
      pending,
      attended,
      attendanceRate: getAttendanceRate(attended, totalStudents),
    },
    students,
  };
};

const updateAttendanceRecord = async (params: {
  attendanceSessionId: number;
  studentId: number;
  teacherUserId: number;
  newStatus: AttendanceRecordStatus;
  note?: string;
}) => {
  const teacherId = await getTeacherIdByUserId(params.teacherUserId);

  if (!teacherId) {
    return null;
  }

  // Verify session belongs to this teacher
  const session = await prisma.attendance_Session.findFirst({
    where: {
      id_attendance_session: params.attendanceSessionId,
      course_schedule: {
        course_class: {
          id_teacher: teacherId,
        },
      },
    },
    select: {
      id_attendance_session: true,
      status: true,
      course_schedule: {
        select: {
          id_course_class: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Verify student is enrolled in the course class
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      id_student: params.studentId,
      id_course_class: session.course_schedule.id_course_class,
    },
    select: { id_enrollment: true },
  });

  if (!enrollment) {
    return { error: 'NOT_ENROLLED' };
  }

  const now = new Date();

  // Upsert attendance record
  const existingRecord = await prisma.attendance_Record.findUnique({
    where: {
      id_attendance_session_id_student: {
        id_attendance_session: params.attendanceSessionId,
        id_student: params.studentId,
      },
    },
    select: { id_attendance_record: true },
  });

  let record;

  if (existingRecord) {
    record = await prisma.attendance_Record.update({
      where: { id_attendance_record: existingRecord.id_attendance_record },
      data: {
        status: params.newStatus,
        note: params.note ?? null,
        is_manual_update: true,
        updated_at: now,
      },
      select: {
        id_attendance_record: true,
        status: true,
        note: true,
        is_manual_update: true,
        checkin_time: true,
        updated_at: true,
        created_at: true,
      },
    });
  } else {
    record = await prisma.attendance_Record.create({
      data: {
        id_attendance_session: params.attendanceSessionId,
        id_student: params.studentId,
        enrollmentId_enrollment: enrollment.id_enrollment,
        status: params.newStatus,
        note: params.note ?? null,
        is_manual_update: true,
        updated_at: now,
      },
      select: {
        id_attendance_record: true,
        status: true,
        note: true,
        is_manual_update: true,
        checkin_time: true,
        updated_at: true,
        created_at: true,
      },
    });
  }

  return {
    idAttendanceRecord: record.id_attendance_record,
    status: record.status,
    note: record.note,
    isManualUpdate: record.is_manual_update,
    checkinTime: record.checkin_time?.toISOString() ?? null,
    updatedAt: record.updated_at?.toISOString() ?? null,
    createdAt: record.created_at.toISOString(),
  };
};

export const CourseClassService = {
  getCourseClassesByTeacherUserId,
  getCourseClassSchedules,
  getStudentsByCourseClassId,
  getAttendanceSessionStudents,
  updateAttendanceRecord,
};
