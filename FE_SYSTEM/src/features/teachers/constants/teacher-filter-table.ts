import { FormFieldType } from '@/shared/types/form-field-type';

export const teacherFilters = [
  {
    name: 'keySearch',
    type: FormFieldType.Input,
    placeholder: 'Tìm kiếm theo mã, tên, email...',
  },
  {
    name: 'status',
    type: FormFieldType.Select,
    placeholder: 'Trạng thái',
    options: [
      { label: 'Hoạt động', value: 'ACTIVE' },
      { label: 'Ngưng hoạt động', value: 'INACTIVE' },
    ],
  },
];
