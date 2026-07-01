import CardCustom from '@/shared/components/card/CardCustom'
import { Button, Form, Image } from 'antd'
import Logo from '@/assets/images/logo.png';
import { loginFormFields } from '@/features/auth/constants/login-form-fields';
import InputCustom from '@/shared/components/input/InputCustom';
import { FormFieldType } from '@/shared/types/form-field-type';
import InputPasswordCustom from '@/shared/components/input/InputPasswordCustom';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { useNotification } from '@/shared/hooks/useNotification';
import { loginThunk } from '@/features/auth/store/auth-thunk';

type LoginFromValues = {
    email: string
    password: string
}

export default function AuthLogin() {
    const [form] = Form.useForm<LoginFromValues>()
    const dispatch = useAppDispatch()
    const {loading} = useAppSelector((state) => state.auth)
      const { showNotification } = useNotification();
    const onFinish = async (values: LoginFromValues) => {
        try {
            await dispatch(loginThunk(values)).unwrap();
            showNotification('success', 'Đăng nhập thành công');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            showNotification('error', 'Đăng nhập thất bại',error);
        }
    }
  return (
    <CardCustom className="mx-auto mt-20 w-full max-w-md p-8">
        <div className="mx-auto flex h-24 w-24 items-center justify-center">
        <Image src={Logo} preview={false} />
      </div>
      <div className="mb-2 text-center">
        <h1 className="mb-2 font-bold text-2xl">Đăng nhập</h1>

        <span className="text-gray-500">Nhập thông tin tài khoản để tiếp tục</span>
      </div>
      <Form form={form} layout="vertical" autoComplete="off" onFinish={onFinish}>
        {loginFormFields.map((field) => (
          <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            rules={field.rules}
          >
            {(() => {
              switch (field.type) {
                case FormFieldType.InputPassword:
                  return (
                    <InputPasswordCustom placeholder={field.placeholder} prefix={<field.icon />} />
                  );
                case FormFieldType.Input:
                default:
                  return <InputCustom placeholder={field.placeholder} prefix={<field.icon />} />;
              }
            })()}
          </Form.Item>
        ))}
        <Form.Item className="mb-4 text-center">
          <Button loading={loading} htmlType="submit" type="primary" block>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </CardCustom>
  )
}

