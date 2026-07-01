import { Image, type ConfigProviderProps } from 'antd';
import EmptyImg from '@/assets/images/empty.png';

interface EmptyCustomProps extends ConfigProviderProps {
  title?: string;
}

const EmptyCustom: React.FC<EmptyCustomProps> = ({ title }) => {
  return (
    <div className="flex flex-col gap-2 w-full justify-center items-center ">
      <Image src={EmptyImg} alt="No data" width={40} height={40} />
      <p className="text-gray-500 dark:text-gray-400">{title || 'Không có dữ liệu'}</p>
    </div>
  );
};
export default EmptyCustom;
