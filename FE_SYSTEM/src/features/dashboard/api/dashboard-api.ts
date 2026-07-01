import { axiosCilent } from '@/shared/lib/axios';
import type { DashboardDataType } from '@/features/dashboard/types/dashboardType';

export const getDashboardData = {
  getDashboard: async (): Promise<DashboardDataType> => {
    const response = await axiosCilent.get<{ data: DashboardDataType }>('/dashboard');

    return response.data.data;
  },
};
