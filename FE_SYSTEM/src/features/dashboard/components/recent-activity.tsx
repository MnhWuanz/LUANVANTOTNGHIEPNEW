import { Timeline } from 'antd';
import EmptyCustom from '@/shared/components/empty/EmptyCustom';
import { UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import CardCustom from '@/shared/components/card/CardCustom';
import { ActivityType } from '@/features/dashboard/constant/activity';
import type { RecentActivityItem } from '@/features/dashboard/types/recent-activity-type';
import { formatDate } from '@/shared/utils/date';

interface RecentActivityProps {
  data: RecentActivityItem[];
}

const activityConfig = {
  [ActivityType.STUDENT]: {
    icon: <UserOutlined />,
    color: 'text-green-500',
  },
  [ActivityType.TEACHER]: {
    icon: <UserOutlined />,
    color: 'text-blue-500',
  },
  [ActivityType.COURSE]: {
    icon: <ClockCircleOutlined />,
    color: 'text-purple-500',
  },
  [ActivityType.ENROLLMENT]: {
    icon: <ClockCircleOutlined />,
    color: 'text-red-500',
  },
};

const RecentActivity: React.FC<RecentActivityProps> = ({ data }) => {
  return (
    <CardCustom title="Hoạt động gần đây">
      {data && data.length > 0 ? (
        <Timeline
          items={data.map((item, index) => {
            const config = activityConfig[item.type];
            return {
              key: index,
              icon: <span className={config.color}>{config.icon}</span>,
              content: (
                <>
                  <div className="font-bold">{item.title}</div>
                  <div className="font-medium">{item.message}</div>
                  <div className="text-sm text-gray-400">{formatDate(item.date)}</div>
                </>
              ),
            };
          })}
        />
      ) : (
        <EmptyCustom title="Không có hoạt động gần đây" />
      )}
    </CardCustom>
  );
};

export default RecentActivity;
