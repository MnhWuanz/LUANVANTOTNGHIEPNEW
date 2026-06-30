import { FormFieldType } from '@/shared/types/form-field-type';
import type { FormContext, FormField } from '@/shared/components/modal/ModalFormCustom';
import { USER_ROLE } from '@/features/users/types/user-role-type';
import { FormModalMode } from '@/shared/types/form-modal-mode-type';
import type { Teacher } from '../types/teacher-type';

export const teacherFormFields: FormField<Teacher>[] = [
  {
    name: 'teacher_code',
    label: 'Mã giáo viên',
    type: FormFieldType.Input,
    placeholder: 'Mã giáo viên',
    disabled: ({ role, mode }: FormContext) =>
      role !== USER_ROLE.ADMIN || mode === FormModalMode.CREATE,
  },
];
