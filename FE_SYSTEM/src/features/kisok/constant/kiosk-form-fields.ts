import { FormFieldType } from '@/shared/types/form-field-type';
import type { FormField } from '@/shared/components/modal/ModalFormCustom';
import { getAvailableRoomsForKioskOptions } from '@/features/room/api/room-api';
import type { Kiosk } from '../types/kiosk-type';

export const kioskFormFields: FormField<Kiosk>[] = [
  {
    name: 'device_name',
    label: 'Tên thiết bị',
    type: FormFieldType.Input,
    placeholder: 'Nhập tên thiết bị',
    col: 24,
    rules: [{ required: true, message: 'Vui lòng nhập tên thiết bị' }],
  },
  {
    name: 'id_room',
    label: 'Phòng học',
    type: FormFieldType.SelectFetch,
    placeholder: 'Chọn phòng học chưa có thiết bị',
    col: 24,
    fetchOptions: getAvailableRoomsForKioskOptions,
    rules: [{ required: true, message: 'Vui lòng chọn phòng học' }],
  },
];
