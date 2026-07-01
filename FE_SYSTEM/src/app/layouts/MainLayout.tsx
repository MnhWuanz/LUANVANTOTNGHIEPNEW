import { useEffect, useState } from 'react';
import { Drawer, Grid, Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AppSidebar from './components/AppSidebar';
import AppHeader from './components/AppHeader';
import { useAppSelector } from '@/app/redux/hooks';
import { USER_ROLE } from '@/features/users/types/user-role-type';

const { Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [teacherMenuOpen, setTeacherMenuOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const { user } = useAppSelector((state) => state.auth);
  const compactTeacher = user?.role === USER_ROLE.TEACHER && !screens.lg;

  useEffect(() => {
    if (!compactTeacher) {
      setTeacherMenuOpen(false);
    }
  }, [compactTeacher]);

  return (
    <Layout className="h-screen">
      {!compactTeacher && <AppSidebar collapsed={collapsed} />}

      <Drawer
        open={compactTeacher && teacherMenuOpen}
        onClose={() => setTeacherMenuOpen(false)}
        placement="left"
        width={280}
        closable={false}
        styles={{ body: { padding: 0 } }}
      >
        <AppSidebar
          collapsed={false}
          drawerMode
          onNavigate={() => setTeacherMenuOpen(false)}
        />
      </Drawer>

      <Layout>
        <AppHeader
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          compactTeacher={compactTeacher}
          onOpenMobileMenu={() => setTeacherMenuOpen(true)}
        />
        <Content className={compactTeacher ? 'bg-[#f5f5f5] dark:bg-[#0f1419] p-3 md:p-4 overflow-auto' : 'bg-[#f5f5f5] dark:bg-[#0f1419] p-6 overflow-auto'}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
