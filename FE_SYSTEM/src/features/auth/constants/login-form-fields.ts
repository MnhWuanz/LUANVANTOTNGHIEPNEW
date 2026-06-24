import { FormFieldType } from '@/shared/types/form-field-type';
import { rules } from '@/shared/utils/rules';
import { LockOutlined, MailOutlined } from '@ant-design/icons';

export const loginFormFields = [
  {
    name: 'email',
    label: 'Email',
    type: FormFieldType.Input,
    placeholder: 'Nhập email',
    icon: MailOutlined,
    rules: [
      {
        required: true,
        message: 'Vui lòng nhập email',
      },
      rules.email,
    ],
  },
  {
    name: 'password',
    label: 'Mật khẩu',
    type: FormFieldType.InputPassword,
    placeholder: 'Nhập mật khẩu',
    icon: LockOutlined,
    rules: [
      {
        required: true,
        message: 'Vui lòng nhập mật khẩu',
      },
      rules.password,
    ],
  },
];
