export type DashboardTone = 'blue' | 'green' | 'red' | 'gold' | 'cyan';
export type AttendanceSessionStatus = 'NOT_STARTED' | 'OPEN' | 'CLOSED';
export type AttendanceRecordStatus = 'PRESENT' | 'LATE' | 'ABSENT';
export type KioskStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
export type DashboardAlertSeverity = 'info' | 'warning' | 'error';
export type RecentActivityType = 'ATTENDANCE' | 'KIOSK' | 'SYNC';

export interface DashboardStatItem {
  key: string;
  title: string;
  value: string;
  extra: string;
  tone: DashboardTone;
}

export interface SessionStatusSummary {
  total: number;
  notStarted: number;
  open: number;
  closed: number;
}

export interface AttendanceSummary {
  totalRecords: number;
  expectedAttendanceSlots: number;
  attendedRecords: number;
  present: number;
  late: number;
  absent: number;
  attendanceRate: number;
}

export interface KioskHealthItem {
  id: number;
  deviceCode: string;
  deviceName: string;
  roomCode: string;
  status: KioskStatus;
  isActive: boolean;
  lastSeenAt: string | null;
  online: boolean;
}

export interface KioskHealthSummary {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  blocked: number;
  online: number;
  offline: number;
  onlineThresholdMinutes: number;
  items: KioskHealthItem[];
}

export interface DashboardTodaySession {
  id: number;
  courseCode: string;
  subjectName: string;
  teacherName: string;
  roomCode: string;
  shift: string;
  status: AttendanceSessionStatus;
  checkinOpenAt: string;
  checkinCloseAt: string;
  attendedCount: number;
  totalStudents: number;
  attendanceRate: number;
}

export interface DashboardAlertItem {
  key: string;
  severity: DashboardAlertSeverity;
  title: string;
  message: string;
  count: number;
}

export interface DashboardRecentActivity {
  key: string;
  type: RecentActivityType;
  title: string;
  message: string;
  date: string;
  meta: string;
}

export interface DashboardSyncSummary {
  latestSyncedAt: string;
  totalRecords: number;
  totalCreated: number;
  totalUpdated: number;
}

export interface DashboardDataType {
  generatedAt: string;
  today: string;
  notes: string[];
  statData: DashboardStatItem[];
  sessionStatusSummary: SessionStatusSummary;
  attendanceSummary: AttendanceSummary;
  kioskHealth: KioskHealthSummary;
  todaySessions: DashboardTodaySession[];
  alerts: DashboardAlertItem[];
  recentActivities: DashboardRecentActivity[];
  sync: DashboardSyncSummary | null;
}
