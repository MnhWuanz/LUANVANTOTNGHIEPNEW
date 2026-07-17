import { axiosCilent } from '@/shared/lib/axios';
import type {
  TeacherAttendanceSessionStudentsData,
  TeacherCourseClassItem,
  TeacherCourseClassSchedulesData,
  UpdateAttendanceRecordPayload,
  UpdateAttendanceRecordResponse,
} from '../types/teacher-course-class-type';

export const teacherCourseClassApi = {
  getMyCourseClasses: async (): Promise<TeacherCourseClassItem[]> => {
    const res = await axiosCilent.get<{ data: TeacherCourseClassItem[] }>(
      '/teachers/me/course-classes',
    );

    return res.data.data;
  },

  getCourseClassSchedules: async (
    courseClassId: number,
  ): Promise<TeacherCourseClassSchedulesData> => {
    const res = await axiosCilent.get<{
      data: TeacherCourseClassSchedulesData;
    }>(`/teachers/me/course-classes/${courseClassId}/schedules`);

    return res.data.data;
  },

  getAttendanceSessionStudents: async (
    attendanceSessionId: number,
  ): Promise<TeacherAttendanceSessionStudentsData> => {
    const res = await axiosCilent.get<{
      data: TeacherAttendanceSessionStudentsData;
    }>(`/teachers/me/attendance-sessions/${attendanceSessionId}/students`);

    return res.data.data;
  },

  updateAttendanceRecord: async (
    attendanceSessionId: number,
    studentId: number,
    payload: UpdateAttendanceRecordPayload,
  ): Promise<UpdateAttendanceRecordResponse> => {
    const res = await axiosCilent.patch<UpdateAttendanceRecordResponse>(
      `/teachers/me/attendance-sessions/${attendanceSessionId}/students/${studentId}/record`,
      payload,
    );

    return res.data;
  },
};

