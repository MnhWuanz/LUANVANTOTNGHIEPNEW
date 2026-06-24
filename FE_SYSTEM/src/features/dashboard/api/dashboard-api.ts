import { axiosCilent } from "@/shared/lib/axios";
import type { DashboardDataType } from "@/features/dashboard/types/dashboardType";

export const getDashboardData =  {
    getDashboard: async (): Promise<DashboardDataType> => {
        try {
            const response = await axiosCilent.get<{ data: DashboardDataType }>("/dashboard");
            return response.data.data;
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            throw error;
        }
    }
}