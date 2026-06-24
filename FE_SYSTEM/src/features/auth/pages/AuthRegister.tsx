import CardCustom from '@/shared/components/card/CardCustom'
import { Button, Form, Image } from 'antd'
import YoeduLogo from '@/assets/images/yoedu-logo.svg';
import InputCustom from '@/shared/components/input/InputCustom';
import { FormFieldType } from '@/shared/types/form-field-type';
import InputPasswordCustom from '@/shared/components/input/InputPasswordCustom';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { useNotification } from '@/shared/hooks/useNotification';
import {  registerThunk } from '@/features/auth/store/auth-thunk';
import { registerFormFields } from '@/features/auth/constants/register-form-fields';
import { Link } from 'react-router-dom';


type RegisterFromValues = {
    email: string
    password: string
    repassword: string
}

export default function AuthRegister() {
    const [form] = Form.useForm<RegisterFromValues>()
    const dispatch = useAppDispatch()
    const {loading} = useAppSelector((state) => state.auth)
      const { showNotification } = useNotification();

    const onFinish = async (values: RegisterFromValues) => {
        if(values.password !== values.repassword) {
            showNotification('error', 'Mật khẩu không khớp');
            return;
        }
        try {
            await dispatch(registerThunk(values)).unwrap();
            showNotification('success', 'Đăng ký thành công');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
          console.error('Đăng ký thất bại:', error);
            // showNotification('error', 'Đăng ký thất bại',error);
        }
    }
  return (
    <CardCustom className="mx-auto mt-20 w-full max-w-md p-8">
        <div className="mx-auto flex h-24 w-24 items-center justify-center">
        <Image src={YoeduLogo} preview={false} />
      </div>
      <div className="mb-2 text-center">
        <h1 className="mb-2 font-bold text-2xl">Đăng Ký</h1>

        <span className="text-gray-500">Nhập thông tin tài khoản để đăng ký</span>
      </div>
      <Form form={form} layout="vertical" autoComplete="off" onFinish={onFinish}>
        {registerFormFields.map((field) => (
          <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            rules={field.name === 'repassword' ? [
              {
                required: true,
                message: 'Vui lòng nhập lại mật khẩu',
              },
              {
                validator: (_, value) => {
                  if (!value || form.getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu không khớp'));
                },
              }
            ] : field.rules}
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
            Đăng ký
          </Button>
          <Link to="/auth/login" className="text-sm text-blue-600 hover:text-blue-500">
            Bạn đã có tài khoản? Đăng nhập ngay
          </Link>
        </Form.Item>
      </Form>
    </CardCustom>
  )
}
