export type AttendanceSessionStatus = 'NOT_STARTED' | 'OPEN' | 'CLOSED' | 'CANCELLED';

export interface AttendanceSession {
  id: number;
  idAttendanceSession: number;
  status: AttendanceSessionStatus;
  sessionDate: string;
  checkinOpenAt: string;
  checkinCloseAt: string;
  openedAt: string | null;
  closedAt: string | null;
  isManual: boolean;
  manualReason: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  subjectName: string;
  courseCode: string;
  room: string;
  shift: string;
  teacherName: string;
  totalStudents: number;
  attendedCount: number;
  attendanceRate: number;
}

export interface AttendanceSessionStatusUpdated {
  opened: number;
  closed: number;
}

export interface AttendanceSessionListData {
  date: string;
  total: number;
  statusUpdated: AttendanceSessionStatusUpdated;
  sessions: AttendanceSession[];
}

export interface AttendanceSessionGenerateData {
  date: string;
  totalSchedules: number;
  created: number;
  existed: number;
  statusUpdated: AttendanceSessionStatusUpdated;
}

export interface AttendanceSessionListResponse {
  success: boolean;
  message: string;
  data: AttendanceSessionListData;
}

export interface AttendanceSessionGenerateResponse {
  success: boolean;
  message: string;
  data: AttendanceSessionGenerateData;
}

export interface CreateManualSessionPayload {
  idCourseSchedule: number;
  sessionDate: string;
  reason?: string;
}

export interface CheckConflictsPayload {
  idCourseSchedule: number;
  sessionDate: string;
}

export interface ScheduleConflict {
  subjectName: string;
  courseCode: string;
  teacherName: string;
  room: string;
  shift: string;
  checkinOpenAt: string;
  checkinCloseAt: string;
}

export interface CheckConflictsData {
  hasExisting: boolean;
  hasConflict: boolean;
  schedule: {
    idCourseSchedule: number;
    subjectName: string;
    courseCode: string;
    teacherName: string;
    room: string;
    shift: string;
  };
  conflicts: ScheduleConflict[];
}

export interface CheckConflictsResponse {
  success: boolean;
  data: CheckConflictsData;
}

export interface CourseScheduleItem {
  idCourseSchedule: number;
  courseCode: string;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  dayOfWeek: number;
  room: string;
  shift: string;
  startDate: string;
  endDate: string;
}
