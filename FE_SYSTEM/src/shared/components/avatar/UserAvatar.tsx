import { useAppSelector } from '@/app/redux/hooks';
import { Avatar } from 'antd';

interface UserAvatarProps {
  size?: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ size = 80 }) => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <Avatar size={size} src={user?.avatarUrl}>
      {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
    </Avatar>
  );
};

export default UserAvatar;
