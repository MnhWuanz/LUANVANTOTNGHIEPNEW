import { FormFieldType } from '@/shared/types/form-field-type';
import { rules } from '@/shared/utils/rules';
import type { FormField } from '@/shared/components/modal/ModalFormCustom';
import type { User } from '../types/user-type';

type GetFieldValue = (name: string) => unknown;

export const generalInfoFormFields: FormField<User>[] = [
  {
    name: 'email',
    label: 'Email',
    type: FormFieldType.Input,
    placeholder: 'Nhập email',
    rules: [
      {
        required: true,
        message: 'Vui lòng nhập email',
      },
      rules.email,
    ],
  },
  {
    name: 'full_name',
    label: 'Họ và tên',
    type: FormFieldType.Input,
    placeholder: 'Nhập họ và tên',
    rules: [
      {
        required: true,
        message: 'Vui lòng nhập họ và tên',
      },
    ],
  },
  {
    name: 'password',
    label: 'Mật khẩu',
    type: FormFieldType.InputPassword,
    placeholder: 'Nhập mật khẩu',
    rules: [
      {
        required: true,
        message: 'Vui lòng nhập mật khẩu',
      },
      rules.password,
    ],
  },
  {
    name: 'confirm_password',
    label: 'Xác nhận mật khẩu',
    type: FormFieldType.InputPassword,
    placeholder: 'Xác nhận mật khẩu',
    rules: [
      {
        required: true,
        message: 'Vui lòng nhập mật khẩu',
      },
      rules.password,
      ({ getFieldValue }: { getFieldValue: GetFieldValue }) => ({
        validator(_: unknown, value?: string) {
          if (!value || getFieldValue('password') === value) {
            return Promise.resolve();
          }

          return Promise.reject(new Error('Mật khẩu không khớp'));
        },
      }),
    ],
  },
];
