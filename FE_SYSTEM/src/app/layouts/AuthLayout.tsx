import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

const AuthLayout = () => {
  return (
    <Layout className="h-screen flex items-center justify-center">
      <Content className="w-full max-w-md flex flex-col items-center justify-center">
        <Outlet />
      </Content>
    </Layout>
  );
};

export default AuthLayout;
