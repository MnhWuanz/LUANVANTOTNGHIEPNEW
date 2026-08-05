import { axiosCilent } from '@/shared/lib/axios';
import type {
  AttendanceSessionGenerateResponse,
  AttendanceSessionListResponse,
  CheckConflictsPayload,
  CheckConflictsResponse,
  CourseScheduleItem,
  CreateManualSessionPayload,
} from '../types/attendance-session-type';

export const attendanceSessionApi = {
  getAll: async (date?: string): Promise<AttendanceSessionListResponse> => {
    const res = await axiosCilent.get('/attendance-sessions', {
      params: date ? { date } : undefined,
    });

    return res.data;
  },

  generateToday: async (): Promise<AttendanceSessionGenerateResponse> => {
    const res = await axiosCilent.post('/attendance-sessions/generate');

    return res.data;
  },

  cancelSession: async (id: number, reason: string) => {
    const res = await axiosCilent.patch(`/attendance-sessions/${id}/cancel`, { reason });

    return res.data;
  },

  createManualSession: async (payload: CreateManualSessionPayload) => {
    const res = await axiosCilent.post('/attendance-sessions/manual', payload);

    return res.data;
  },

  checkConflicts: async (payload: CheckConflictsPayload): Promise<CheckConflictsResponse> => {
    const res = await axiosCilent.post('/attendance-sessions/check-conflicts', payload);

    return res.data;
  },

  getAllCourseSchedules: async (): Promise<{ success: boolean; data: CourseScheduleItem[] }> => {
    const res = await axiosCilent.get('/attendance-sessions/course-schedules');

    return res.data;
  },
};

