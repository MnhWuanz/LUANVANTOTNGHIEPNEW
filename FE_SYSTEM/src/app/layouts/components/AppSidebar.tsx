import { Image, Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BookOutlined,
  CalendarOutlined,
  DashboardOutlined,
  DesktopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import YoeduLogo from '@/assets/images/yoedu-logo.svg';
import { useTheme } from '@/app/providers/theme/hooks/useTheme';

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
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
      key: '/students',
      icon: <UserOutlined />,
      label: 'Học viên',
    },
    {
      key: '/teachers',
      icon: <UserOutlined />,
      label: 'Giáo viên',
    },
  ];

  return (
    <Sider width={240} collapsed={collapsed}>
      <div
        className={`h-16 flex items-center justify-center border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <Image src={YoeduLogo} preview={false} width={collapsed ? 48 : 64} />
      </div>

      <Menu
        theme={theme}
        mode="inline"
        items={items}
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default AppSidebar;
