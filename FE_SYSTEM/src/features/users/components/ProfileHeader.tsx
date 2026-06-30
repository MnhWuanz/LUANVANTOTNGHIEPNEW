import { Flex, Space, Tag, Typography } from 'antd';

import CardCustom from '@/shared/components/card/CardCustom';
import { useAppSelector } from '@/app/redux/hooks';
import UserAvatar from '@/shared/components/avatar/UserAvatar';

const { Title, Text } = Typography;

const ProfileHeader = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) return null;

  return (
    <CardCustom>
      <Flex align="center" gap={20}>
        <UserAvatar />

        <Flex vertical gap={4}>
          <Title level={3} className="mb-0!">
            {user.full_name}
          </Title>

          <Space>
            <Tag color="blue">{user.role}</Tag>

            {/* <Tag color="green">{user.status}</Tag> */}
          </Space>

          <Text type="secondary">{user.email}</Text>
        </Flex>
      </Flex>
    </CardCustom>
  );
};

export default ProfileHeader;
