import type { DashboardTone, AttendanceSessionStatus } from './dashboardType';

export interface TeacherDashboardStatItem {
  key: string;
  title: string;
  value: string;
  extra: string;
  tone: DashboardTone;
}

export interface TeacherAttendanceSummary {
  present: number;
  late: number;
  absent: number;
  attendedRecords: number;
  expectedSlots: number;
  attendanceRate: number;
}

export interface FaceRegistrationByClass {
  courseCode: string;
  subjectName: string;
  registered: number;
  total: number;
  rate: number;
}

export interface FaceRegistrationSummary {
  totalStudents: number;
  registered: number;
  notRegistered: number;
  rate: number;
  byClass: FaceRegistrationByClass[];
}

export interface TeacherTodaySession {
  id: number;
  courseCode: string;
  subjectName: string;
  roomCode: string;
  shift: string;
  status: AttendanceSessionStatus;
  checkinOpenAt: string;
  checkinCloseAt: string;
  attendedCount: number;
  totalStudents: number;
  attendanceRate: number;
}

export interface UnregisteredStudent {
  id_student: number;
  student_code: string;
  full_name: string;
  class: string;
  course_code: string;
  subject_name: string;
}

export interface TeacherDashboardData {
  generatedAt: string;
  today: string;
  teacher: {
    fullName: string;
    teacherCode: string;
  };
  statData: TeacherDashboardStatItem[];
  attendanceSummary: TeacherAttendanceSummary;
  faceRegistrationSummary: FaceRegistrationSummary;
  todaySessions: TeacherTodaySession[];
  unregisteredStudents: UnregisteredStudent[];
}
