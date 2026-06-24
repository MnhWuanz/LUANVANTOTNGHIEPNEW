import type { ActivityType } from "@/features/dashboard/constant/activity";


export type RecentActivityItem = {
  type: (typeof ActivityType)[keyof typeof ActivityType];
  title: string;
  message: string;
  date: string;
};
