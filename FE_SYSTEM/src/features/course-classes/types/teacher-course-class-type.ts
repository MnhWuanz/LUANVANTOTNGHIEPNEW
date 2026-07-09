export interface TeacherCourseClassItem {
  id_course_class: number;
  course_code: string;
  subject_name: string;
  subject_code: string;
  total_students: number;
}

export type AttendanceSessionStatus = 'NOT_STARTED' | 'OPEN' | 'CLOSED';
export type AttendanceRecordStatus = 'PRESENT' | 'LATE' | 'ABSENT';
export type EffectiveAttendanceStatus = AttendanceRecordStatus | 'PENDING';

export interface TeacherCourseClassInfo {
  idCourseClass: number;
  courseCode: string;
  subjectCode: string;
  subjectName: string;
  totalStudents: number;
}

export interface TeacherCourseClassSummary {
  totalSchedules: number;
  totalSessions: number;
  totalStudents: number;
  attendedSlots: number;
  expectedSlots: number;
  averageAttendanceRate: number;
}

export interface TeacherShiftStart {
  name: string;
  startTime: string;
}

export interface TeacherShiftEnd {
  name: string;
  endTime: string;
}

export interface TeacherRoomInfo {
  idRoom: number;
  roomCode: string;
}

export interface TeacherAttendanceSession {
  idAttendanceSession: number;
  sessionDate: string;
  status: AttendanceSessionStatus;
  checkinOpenAt: string;
  checkinCloseAt: string;
  openedAt: string | null;
  closedAt: string | null;
  totalStudents: number;
  present: number;
  late: number;
  absent: number;
  pending: number;
  attended: number;
  attendanceRate: number;
}

export interface TeacherCourseSchedule {
  idCourseSchedule: number;
  dayOfWeek: number;
  dayOfWeekLabel: string;
  startDate: string;
  endDate: string;
  room: TeacherRoomInfo;
  shift: string;
  startShift: TeacherShiftStart;
  endShift: TeacherShiftEnd;
  sessions: TeacherAttendanceSession[];
}

export interface TeacherCourseClassSchedulesData {
  generatedAt: string;
  timeZone: string;
  courseClass: TeacherCourseClassInfo;
  summary: TeacherCourseClassSummary;
  schedules: TeacherCourseSchedule[];
}

export interface TeacherAttendanceSessionInfo {
  idAttendanceSession: number;
  idCourseSchedule: number;
  sessionDate: string;
  status: AttendanceSessionStatus;
  checkinOpenAt: string;
  checkinCloseAt: string;
  openedAt: string | null;
  closedAt: string | null;
  dayOfWeek: number;
  dayOfWeekLabel: string;
  room: TeacherRoomInfo;
  shift: string;
  startShift: TeacherShiftStart;
  endShift: TeacherShiftEnd;
  courseClass: Omit<TeacherCourseClassInfo, 'totalStudents'>;
}

export interface TeacherAttendanceSessionSummary {
  totalStudents: number;
  present: number;
  late: number;
  absent: number;
  pending: number;
  attended: number;
  attendanceRate: number;
}

export interface TeacherAttendanceStudent {
  idStudent: number;
  studentCode: string;
  fullName: string;
  email: string;
  class: string;
  effectiveAttendanceStatus: EffectiveAttendanceStatus;
  recordStatus: AttendanceRecordStatus | null;
  inferredAbsent: boolean;
  idAttendanceRecord: number | null;
  checkinTime: string | null;
  confidence: number | null;
  createdAt: string | null;
  kiosk: {
    idKiosk: number;
    deviceCode: string;
    deviceName: string;
    roomCode: string | null;
  } | null;
}

export interface TeacherAttendanceSessionStudentsData {
  generatedAt: string;
  timeZone: string;
  session: TeacherAttendanceSessionInfo;
  summary: TeacherAttendanceSessionSummary;
  students: TeacherAttendanceStudent[];
}
