import { USER_STATUS } from '../types/user-status-type';

export const userStatusOptions = [
  { label: 'Hoạt động', value: USER_STATUS.ACTIVE },
  { label: 'Ngưng hoạt động', value: USER_STATUS.INACTIVE },
  { label: 'Đã xóa', value: USER_STATUS.DELETED },
];
