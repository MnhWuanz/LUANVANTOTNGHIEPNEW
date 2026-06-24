import { Card, Skeleton } from 'antd';

export default function SkeletonCard() {
  return <div>
    <Card className='rounded-xl shadow-sm'>
      <div className="flex flex-col gap-2">
        <span className="text-gray-500">
            <Skeleton active paragraph={false} />

        </span>

        <span className="text-2xl font-semibold" >
                      <Skeleton active paragraph={false} />

        </span>

        <span className="text-sm text-gray-400">
            <Skeleton active paragraph={false} />
          </span>
      </div>
    </Card>
  </div>;
}
