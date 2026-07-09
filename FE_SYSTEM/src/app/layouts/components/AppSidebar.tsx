import { useMemo } from 'react';
import { Image, Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BookOutlined,
  CalendarOutlined,
  CameraOutlined,
  DashboardOutlined,
  DesktopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Logo from '@/assets/images/logo.png';
import { useTheme } from '@/app/providers/theme/hooks/useTheme';
import { useAppSelector } from '@/app/redux/hooks';
import { USER_ROLE } from '@/features/users/types/user-role-type';

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
  drawerMode?: boolean;
  onNavigate?: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, drawerMode = false, onNavigate }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  const items = useMemo(() => {
    const commonItems = [
      {
        key: '/',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
      },
    ];

    const adminItems = [
      {
        key: '/kiosks',
        icon: <DesktopOutlined />,
        label: 'Thiết bị',
      },
      {
        key: '/attendance-sessions',
        icon: <CalendarOutlined />,
        label: 'Điểm danh',
      },
      {
        key: '/teachers',
        icon: <UserOutlined />,
        label: 'Giáo viên',
      },
    ];

    const teacherItems = [
      {
        key: '/course-classes',
        icon: <BookOutlined />,
        label: 'Lớp học phần',
      },
      {
        key: '/face-enrollment',
        icon: <CameraOutlined />,
        label: 'Đăng ký khuôn mặt',
      },
    ];

    if (user?.role === USER_ROLE.ADMIN) {
      return [...commonItems, ...adminItems];
    }

    if (user?.role === USER_ROLE.TEACHER) {
      return [...commonItems, ...teacherItems];
    }

    return commonItems;
  }, [user?.role]);

  const sidebarContent = (
    <>
      <div
        className={`h-16 flex items-center justify-center border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <Image src={Logo} preview={false} width={collapsed && !drawerMode ? 48 : 72} />
      </div>

      <Menu
        theme={theme}
        mode="inline"
        items={items}
        selectedKeys={[location.pathname]}
        onClick={({ key }) => {
          navigate(key);
          onNavigate?.();
        }}
      />
    </>
  );

  if (drawerMode) {
    return <div className="h-full bg-white dark:bg-[#001529]">{sidebarContent}</div>;
  }

  return (
    <Sider width={240} collapsed={collapsed}>
      {sidebarContent}
    </Sider>
  );
};

export default AppSidebar;
