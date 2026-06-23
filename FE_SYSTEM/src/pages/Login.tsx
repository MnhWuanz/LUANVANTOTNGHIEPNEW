import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hook';
import { loginUser } from '../store/slices/authSlice';

interface LoginProps {
  setRole: (role: 'admin' | 'teacher') => void;
}

export const Login: React.FC<LoginProps> = ({ setRole }) => {
  const [roleSelection, setRoleSelection] = useState<'admin' | 'teacher'>(
    'admin',
  );
  
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      // Gọi action login từ Redux slice
      const result = await dispatch(
        loginUser({
          email: values.username,
          password: values.password,
        })
      ).unwrap();

      // Chuẩn hóa role từ backend (ví dụ: 'ADMIN' -> 'admin')
      const userRole = result.role.toLowerCase() as 'admin' | 'teacher';
      setRole(userRole);

      message.success(
        `Đăng nhập thành công với vai trò ${
          userRole === 'admin' ? 'Quản trị viên' : 'Giảng viên'
        }!`,
      );

      // Điều hướng dựa trên role thực tế từ cơ sở dữ liệu
      if (userRole === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/teacher-dashboard');
      }
    } catch (err: any) {
      message.error(err || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center font-be-vietnam relative overflow-hidden bg-surface">
      {/* Decorative Background Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-container rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 -left-40 w-72 h-72 bg-secondary-container rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-tertiary-container rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      {/* Login Container Card */}
      <div className="w-full max-w-5xl flex rounded-2xl overflow-hidden shadow-2xl z-10 bg-surface-container-lowest mx-4 md:mx-container-padding-desktop">
        {/* Left Side: Login Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">
                face
              </span>
            </div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
              HỆ THỐNG ĐIỂM DANH
            </h1>
          </div>

          <div className="mb-8 text-left">
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mb-2">
              Đăng nhập
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Chào mừng trở lại. Chọn vai trò đăng nhập của bạn.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              type="button"
              onClick={() => setRoleSelection('admin')}
              className={`flex-1 p-4 rounded-xl border text-center transition-all duration-200 flex flex-col items-center gap-2 hover:bg-surface-container-low active:scale-95 ${
                roleSelection === 'admin'
                  ? 'border-primary bg-primary-container/10 ring-1 ring-primary'
                  : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-primary text-[28px]">
                admin_panel_settings
              </span>
              <span className="font-semibold text-xs text-on-surface">
                Quản trị viên
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRoleSelection('teacher')}
              className={`flex-1 p-4 rounded-xl border text-center transition-all duration-200 flex flex-col items-center gap-2 hover:bg-surface-container-low active:scale-95 ${
                roleSelection === 'teacher'
                  ? 'border-primary bg-primary-container/10 ring-1 ring-primary'
                  : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-primary text-[28px]">
                school
              </span>
              <span className="font-semibold text-xs text-on-surface">
                Giảng viên
              </span>
            </button>
          </div>

          {/* Ant Design Form */}
          <Form
            layout="vertical"
            requiredMark={false}
            onFinish={onFinish}
            initialValues={{ remember: true }}
            className="space-y-4"
          >
            <Form.Item
              label={
                <span className="font-semibold text-xs text-on-surface">
                  Tài khoản (Mã CB/GV)
                </span>
              }
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
            >
              <Input
                prefix={<UserOutlined className="text-outline mr-2" />}
                placeholder="Nhập mã đăng nhập"
                size="large"
                className="rounded-lg py-2.5 focus:border-primary border-outline-variant hover:border-primary/50 text-sm font-be-vietnam"
              />
            </Form.Item>

            <Form.Item
              label={
                <div className="flex justify-between items-center w-full">
                  <span className="font-semibold text-xs text-on-surface">
                    Mật khẩu
                  </span>
                  <a
                    className="text-[12px] text-primary hover:underline"
                    href="#forgot"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
              }
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-outline mr-2" />}
                placeholder="••••••••"
                size="large"
                className="rounded-lg py-2.5 focus:border-primary border-outline-variant hover:border-primary/50 text-sm font-be-vietnam"
              />
            </Form.Item>

            <div className="flex items-center justify-between pb-2">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="text-xs text-on-surface-variant font-be-vietnam">
                  Ghi nhớ đăng nhập
                </Checkbox>
              </Form.Item>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full py-3 h-auto bg-primary hover:bg-primary-container border-transparent rounded-lg font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-98"
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* Right Side: Visual Scan illustration (hidden on small/medium screens) */}
        <div className="hidden lg:block w-1/2 relative bg-surface-container-low overflow-hidden">
          {/* Geometric pattern grid */}
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                'radial-gradient(#3525cd 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
            }}
          ></div>

          {/* Abstract Face Recognition Graphic */}
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="relative w-full max-w-sm aspect-square rounded-full border border-primary/10 flex items-center justify-center">
              <div className="absolute inset-8 rounded-full border border-primary/20 animate-pulse"></div>
              <div className="absolute inset-16 rounded-full border border-secondary/20"></div>

              {/* Scanning center ring */}
              <div className="w-36 h-36 bg-primary/5 rounded-full flex items-center justify-center relative backdrop-blur-md border border-primary/20 shadow-inner">
                <span className="material-symbols-outlined text-primary text-[72px]">
                  face_retouching_natural
                </span>

                {/* Simulated scan line */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-primary rounded-full blur-[1px] animate-[scan_3s_ease-in-out_infinite_alternate]"></div>
              </div>

              {/* Status Nodes */}
              <div className="absolute top-1/4 left-1/4 w-3.5 h-3.5 bg-secondary rounded-full shadow-[0_0_12px_rgba(0,108,73,0.6)]"></div>
              <div className="absolute bottom-1/3 right-1/4 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_rgba(53,37,205,0.6)]"></div>
              <div className="absolute top-1/2 right-1/6 w-4 h-4 bg-tertiary rounded-full shadow-[0_0_12px_rgba(104,64,0,0.5)] opacity-60"></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0.2; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(144px); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};
export default Login;
