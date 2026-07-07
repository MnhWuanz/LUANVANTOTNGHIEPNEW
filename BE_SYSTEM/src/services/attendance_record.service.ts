import {
  AttendanceRecordStatus,
  AttendanceSessionStatus,
  FaceEnrollmentStatus,
  KioskStatus,
  Prisma,
} from '@prisma/client';
import { prisma } from 'config/client';
import { comparePassword } from 'src/utils/password.util';
import { AwsRekognitionService } from 'services/aws_rekognition.service';
import { updateAttendanceSessionStatuses } from 'services/attendance_session.service';

const LATE_THRESHOLD_MINUTES = 30;

export class AttendanceCheckInError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

const kioskAuthSelect = {
  id_kiosk: true,
  device_code: true,
  device_name: true,
  device_secret_hash: true,
  status: true,
  is_active: true,
  last_seen_at: true,
  id_room: true,
  room: {
    select: {
      id_room: true,
      room_code: true,
    },
  },
} as const;

const kioskResponseSelect = {
  id_kiosk: true,
  device_code: true,
  device_name: true,
  status: true,
  is_active: true,
  last_seen_at: true,
  id_room: true,
  room: {
    select: {
      id_room: true,
      room_code: true,
    },
  },
} as const;

const attendanceRecordInclude = {
  student: {
    select: {
      id_student: true,
      student_code: true,
      full_name: true,
      class: true,
    },
  },
  face_enrollment: {
    select: {
      id_face_enrollment: true,
      face_id: true,
      collection_id: true,
    },
  },
  kiosk: {
    select: kioskResponseSelect,
  },
  attendance_session: {
    include: {
      course_schedule: {
        include: {
          room: true,
          start_shift: true,
          end_shift: true,
          course_class: {
            include: {
              subject: true,
              teacher: true,
            },
          },
        },
      },
    },
  },
} as const;

function getHeaderValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function buildShiftLabel(startShiftName: string, endShiftName: string) {
  return startShiftName === endShiftName
    ? startShiftName
    : `${startShiftName} - ${endShiftName}`;
}

function mapAttendanceRecord(record: any, duplicate: boolean) {
  const session = record.attendance_session;
  const schedule = session.course_schedule;

  return {
    duplicate,
    record: {
      idAttendanceRecord: record.id_attendance_record,
      status: record.status,
      confidence: record.confidence,
      checkinTime: record.checkin_time?.toISOString() ?? null,
      createdAt: record.created_at.toISOString(),
    },
    student: {
      idStudent: record.student.id_student,
      studentCode: record.student.student_code,
      fullName: record.student.full_name,
      class: record.student.class,
    },
    session: {
      idAttendanceSession: session.id_attendance_session,
      status: session.status,
      checkinOpenAt: session.checkin_open_at.toISOString(),
      checkinCloseAt: session.checkin_close_at.toISOString(),
      courseCode: schedule.course_class.course_code,
      subjectName: schedule.course_class.subject.name,
      teacherName: schedule.course_class.teacher.full_name,
      roomCode: schedule.room.room_code,
      shift: buildShiftLabel(schedule.start_shift.name, schedule.end_shift.name),
    },
    kiosk: {
      idKiosk: record.kiosk?.id_kiosk ?? null,
      deviceCode: record.kiosk?.device_code ?? null,
      deviceName: record.kiosk?.device_name ?? null,
      roomCode: record.kiosk?.room?.room_code ?? null,
    },
    face: record.face_enrollment
      ? {
          idFaceEnrollment: record.face_enrollment.id_face_enrollment,
          faceId: record.face_enrollment.face_id,
          collectionId: record.face_enrollment.collection_id,
        }
      : null,
  };
}

async function authenticateKiosk(params: {
  deviceCode: string | null;
  deviceToken: string | null;
}) {
  if (!params.deviceCode || !params.deviceToken) {
    throw new AttendanceCheckInError(
      401,
      'Thieu x-kiosk-device-code hoac x-kiosk-token',
    );
  }
  const kiosk = await prisma.kiosk.findUnique({
    where: {
      device_code: params.deviceCode,
    },
    select: kioskAuthSelect,
  });

  if (!kiosk) {
    throw new AttendanceCheckInError(404, 'Kiosk khong ton tai');
  }

  if (kiosk.status === KioskStatus.BLOCKED) {
    throw new AttendanceCheckInError(403, 'Kiosk da bi khoa');
  }

  if (kiosk.status !== KioskStatus.ACTIVE || !kiosk.is_active) {
    throw new AttendanceCheckInError(403, 'Kiosk chua duoc kich hoat');
  }

  if (!kiosk.device_secret_hash) {
    throw new AttendanceCheckInError(401, 'Kiosk chua co token xac thuc');
  }

  const validToken = await comparePassword(
    params.deviceToken,
    kiosk.device_secret_hash,
  );

  if (!validToken) {
    throw new AttendanceCheckInError(401, 'Token kiosk khong hop le');
  }

  return prisma.kiosk.update({
    where: {
      id_kiosk: kiosk.id_kiosk,
    },
    data: {
      last_seen_at: new Date(),
    },
    select: kioskResponseSelect,
  });
}

async function findOpenSessionForKiosk(idRoom: number, now: Date) {
  const sessions = await prisma.attendance_Session.findMany({
    where: {
      status: AttendanceSessionStatus.OPEN,
      checkin_open_at: {
        lte: now,
      },
      checkin_close_at: {
        gte: now,
      },
      course_schedule: {
        id_room: idRoom,
      },
    },
    orderBy: {
      checkin_open_at: 'desc',
    },
    take: 2,
    include: {
      course_schedule: {
        include: {
          room: true,
          course_class: true,
        },
      },
    },
  });

  if (sessions.length === 0) {
    throw new AttendanceCheckInError(
      404,
      'Khong co phien diem danh dang mo cho phong cua kiosk',
    );
  }

  if (sessions.length > 1) {
    throw new AttendanceCheckInError(
      409,
      'Co nhieu phien diem danh dang mo trong cung phong',
    );
  }

  return sessions[0];
}

async function findActiveFaceEnrollment(imageBuffer: Buffer) {
  const faceMatch = await AwsRekognitionService.searchStudentFace(imageBuffer);

  if (!faceMatch) {
    throw new AttendanceCheckInError(404, 'Khong nhan dien duoc khuon mat');
  }

  const faceEnrollment = await prisma.face_Enrollment.findFirst({
    where: {
      face_id: faceMatch.faceId,
      collection_id: faceMatch.collectionId,
      status: FaceEnrollmentStatus.ACTIVE,
    },
    include: {
      student: {
        select: {
          id_student: true,
          student_code: true,
          full_name: true,
        },
      },
    },
  });

  if (!faceEnrollment) {
    throw new AttendanceCheckInError(
      404,
      'Khuon mat khong co dang ky ACTIVE trong he thong',
    );
  }

  return {
    faceMatch,
    faceEnrollment,
  };
}

function getAttendanceStatus(checkinTime: Date, checkinOpenAt: Date) {
  const lateAfter = new Date(
    checkinOpenAt.getTime() + LATE_THRESHOLD_MINUTES * 60 * 1000,
  );

  return checkinTime.getTime() > lateAfter.getTime()
    ? AttendanceRecordStatus.LATE
    : AttendanceRecordStatus.PRESENT;
}

async function findExistingAttendanceRecord(params: {
  idAttendanceSession: number;
  idStudent: number;
}) {
  return prisma.attendance_Record.findUnique({
    where: {
      id_attendance_session_id_student: {
        id_attendance_session: params.idAttendanceSession,
        id_student: params.idStudent,
      },
    },
    include: attendanceRecordInclude,
  });
}

const checkInByFace = async (params: {
  imageBuffer: Buffer;
  deviceCode: string | string[] | undefined;
  deviceToken: string | string[] | undefined;
}) => {
  const kiosk = await authenticateKiosk({
    deviceCode: getHeaderValue(params.deviceCode),
    deviceToken: getHeaderValue(params.deviceToken),
  });

  await updateAttendanceSessionStatuses();

  const now = new Date();
  const session = await findOpenSessionForKiosk(kiosk.id_room, now);
  const { faceMatch, faceEnrollment } = await findActiveFaceEnrollment(
    params.imageBuffer,
  );

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      id_student_id_course_class: {
        id_student: faceEnrollment.id_student,
        id_course_class: session.course_schedule.id_course_class,
      },
    },
    select: {
      id_enrollment: true,
    },
  });

  if (!enrollment) {
    throw new AttendanceCheckInError(
      409,
      'Sinh vien khong thuoc lop cua phien diem danh',
    );
  }

  const existingRecord = await findExistingAttendanceRecord({
    idAttendanceSession: session.id_attendance_session,
    idStudent: faceEnrollment.id_student,
  });

  if (existingRecord) {
    return mapAttendanceRecord(existingRecord, true);
  }

  const status = getAttendanceStatus(now, session.checkin_open_at);

  try {
    const record = await prisma.attendance_Record.create({
      data: {
        id_attendance_session: session.id_attendance_session,
        id_student: faceEnrollment.id_student,
        id_face_enrollment: faceEnrollment.id_face_enrollment,
        id_kiosk: kiosk.id_kiosk,
        confidence: faceMatch.similarity,
        status,
        checkin_time: now,
        enrollmentId_enrollment: enrollment.id_enrollment,
      },
      include: attendanceRecordInclude,
    });

    return mapAttendanceRecord(record, false);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const record = await findExistingAttendanceRecord({
        idAttendanceSession: session.id_attendance_session,
        idStudent: faceEnrollment.id_student,
      });

      if (record) {
        return mapAttendanceRecord(record, true);
      }
    }

    throw error;
  }
};

export const AttendanceRecordService = {
  checkInByFace,
};
