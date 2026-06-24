import { Tag } from 'antd';
import type { TodayClassesItem } from '@/features/dashboard/types/today-classes-type';
import CardCustom from '@/shared/components/card/CardCustom';
import EmptyCustom from '@/shared/components/empty/EmptyCustom';

interface TodayClassesProps {
  data: TodayClassesItem[];
}

const TodayClasses: React.FC<TodayClassesProps> = ({ data }) => {
  return (
    <CardCustom title="Lớp học hôm nay">
      <div className="flex flex-col gap-4">
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className="flex justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <p className="text-sm text-gray-400">Giáo viên: {item.teacher}</p>
                <p className="text-sm text-gray-400">Số học viên: {item.totalStudents}</p>
              </div>

              <Tag color="blue" className="self-start">
                {item.time}
              </Tag>
            </div>
          ))
        ) : (
          <EmptyCustom title="Không có lớp học hôm nay" />
        )}
      </div>
    </CardCustom>
  );
};

export default TodayClasses;
