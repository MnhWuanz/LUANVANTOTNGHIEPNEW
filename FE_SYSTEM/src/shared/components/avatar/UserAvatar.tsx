import { useAppSelector } from '@/app/redux/hooks';
import { Avatar } from 'antd';

interface UserAvatarProps {
  size?: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ size = 80 }) => {
  const { user } = useAppSelector((state) => state.auth);
  const displayName = user?.teacher?.full_name || user?.email || 'U';

  return <Avatar size={size}>{displayName.charAt(0).toUpperCase()}</Avatar>;
};

export default UserAvatar;
