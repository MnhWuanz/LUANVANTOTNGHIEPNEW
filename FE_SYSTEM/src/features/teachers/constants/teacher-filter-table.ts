import { userStatusOptions } from '@/features/users/contants/user-status-options';
import { FormFieldType } from '@/shared/types/form-field-type';

export const teacherFilters = [
  {
    name: 'keySearch',
    type: FormFieldType.Input,
    placeholder: 'Tìm kiếm theo email, tên...',
  },
  {
    name: 'status',
    type: FormFieldType.Select,
    placeholder: 'Trạng thái',
    options: userStatusOptions,
  },
];
