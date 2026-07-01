import { axiosCilent } from '@/shared/lib/axios';
import type {
  AttendanceSessionGenerateResponse,
  AttendanceSessionListResponse,
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
};
