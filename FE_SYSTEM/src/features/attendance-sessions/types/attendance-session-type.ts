export type AttendanceSessionStatus = 'NOT_STARTED' | 'OPEN' | 'CLOSED';

export interface AttendanceSession {
  id: number;
  idAttendanceSession: number;
  status: AttendanceSessionStatus;
  sessionDate: string;
  checkinOpenAt: string;
  checkinCloseAt: string;
  openedAt: string | null;
  closedAt: string | null;
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
