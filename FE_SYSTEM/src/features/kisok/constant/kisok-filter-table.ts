import { FormFieldType } from '@/shared/types/form-field-type';
import { KIOSK_STATUS_OPTIONS } from '../types/kiosk-type';

export const kioskFilters = [
  {
    name: 'keySearch',
    type: FormFieldType.Input,
    placeholder: 'Tìm kiếm theo mã, tên thiết bị, phòng...',
  },
  {
    name: 'status',
    type: FormFieldType.Select,
    placeholder: 'Trạng thái',
    options: KIOSK_STATUS_OPTIONS,
  },
];
