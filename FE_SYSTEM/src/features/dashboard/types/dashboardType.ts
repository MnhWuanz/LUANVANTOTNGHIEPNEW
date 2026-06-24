import type { RecentActivityItem } from "@/features/dashboard/types/recent-activity-type";
import type { StartDataType } from "@/features/dashboard/types/startDataType";
import type { TodayClassesItem } from "@/features/dashboard/types/today-classes-type";

export interface DashboardDataType {
  todayClasses: TodayClassesItem[];
  recentActivityData: RecentActivityItem[];
  statData: StartDataType[];
}