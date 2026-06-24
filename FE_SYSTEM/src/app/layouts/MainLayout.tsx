import { useState } from 'react';

import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AppSidebar from './components/AppSidebar';
import AppHeader from './components/AppHeader';

const { Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="h-screen">
      <AppSidebar collapsed={collapsed} />

      <Layout>
        <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content className="p-6 overflow-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
