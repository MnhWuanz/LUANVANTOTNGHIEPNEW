import { axiosCilent } from '@/shared/lib/axios';
import type { DashboardDataType } from '@/features/dashboard/types/dashboardType';
import type { TeacherDashboardData } from '@/features/dashboard/types/teacherDashboardType';

export const getDashboardData = {
  getDashboard: async (): Promise<DashboardDataType> => {
    const response = await axiosCilent.get<{ data: DashboardDataType }>('/dashboard');

    return response.data.data;
  },

  getTeacherDashboard: async (): Promise<TeacherDashboardData> => {
    const response = await axiosCilent.get<{ data: TeacherDashboardData }>(
      '/dashboard/teacher',
    );

    return response.data.data;
  },
};
