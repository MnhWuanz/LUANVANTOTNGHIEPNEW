import { Layout, Dropdown, Badge, Switch } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
  ProfileOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/app/redux/hooks';
import { logout } from '@/features/auth/store/auth-slice';
import { useTheme } from '@/app/providers/theme/hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '@/shared/components/avatar/UserAvatar';

const { Header } = Layout;

interface AppHeaderProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ collapsed, setCollapsed }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const displayName = user?.teacher?.full_name || user?.email;

  const menuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: () => dispatch(logout()),
    },
  ];

  return (
    <Header
      className={`flex justify-between items-center px-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <div className="text-xl cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>

      <div className="flex items-center gap-6">
        <Badge count={5} size="small">
          <BellOutlined className="text-lg cursor-pointer" />
        </Badge>

        <Switch
          checked={theme === 'dark'}
          onChange={toggleTheme}
          checkedChildren={<SunOutlined />}
          unCheckedChildren={<MoonOutlined />}
        />

        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <div className="flex items-center gap-2 cursor-pointer">
            <UserAvatar size={46} />

            <div className="flex flex-col leading-tight">
              <span className="text-red-500 text-sm font-medium">{displayName}</span>
              <span className="text-xs text-gray-400">{user?.role}</span>
            </div>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
