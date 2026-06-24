import { Tag } from 'antd';

import { USER_STATUS, type UserStatusType } from '@/features/users/types/user-status-type';

interface StatusTagProps {
  status?: UserStatusType;
  statusText?: string;
}

const StatusTag = ({ status, statusText }: StatusTagProps) => {
  switch (status) {
    case USER_STATUS.ACTIVE:
      return <Tag color="success">{statusText || 'Hoạt động'}</Tag>;

    case USER_STATUS.INACTIVE:
      return <Tag color="error">{statusText || 'Ngưng hoạt động'}</Tag>;

    case USER_STATUS.DELETED:
      return <Tag>{statusText || 'Đã xóa'}</Tag>;

    default:
      return <Tag>{statusText || 'Không xác định'}</Tag>;
  }
};

export default StatusTag;
