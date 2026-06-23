import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Dropdown, Badge, notification } from 'antd';
import type { MenuProps } from 'antd';
import { useAppDispatch, useAppSelector } from '../store/hook';
import { logoutUser } from '../store/slices/authSlice';
import { io } from 'socket.io-client';

interface HeaderProps {
  role: 'admin' | 'teacher';
  onToggleRole: () => void;
  onToggleSidebarMobile: () => void;
}

interface NotificationItem {
  id: string;
  type: 'sync' | 'attendance' | 'info';
  title: string;
  message: string;
  time: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebarMobile }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [notifications, setNotifications] = React.useState<NotificationItem[]>([
    {
      id: '1',
      type: 'attendance',
      title: 'Cần xác nhận điểm danh',
      message:
        'Sinh viên Trần Thị C (20020003) chờ duyệt khuôn mặt (độ chính xác 85%).',
      time: '2 phút trước',
    },
    {
      id: '2',
      type: 'info',
      title: 'Lớp học phần hoàn thành',
      message:
        'Lớp Cấu trúc Dữ liệu đã hoàn thành điểm danh tự động (42/45 sinh viên).',
      time: '1 giờ trước',
    },
  ]);
  const [unreadCount, setUnreadCount] = React.useState(2);
  React.useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const socketUrl = apiUrl.replace('/api', '');
    const socket = io(socketUrl);

    socket.on('connect', () => {
      console.log('Socket.io connected to backend:', socketUrl);
    });

    socket.on('sync-notification', (data: any) => {
      console.log('Received sync notification event:', data);

      setNotifications((prev) => [
        {
          id: Math.random().toString(),
          type: 'sync',
          title: 'Đồng bộ dữ liệu',
          message: data.message,
          time: 'Vừa xong',
        },
        ...prev,
      ]);
      setUnreadCount((prev) => prev + 1);

      notification.success({
        message: 'Đồng bộ hệ thống',
        description: data.message,
        placement: 'bottomRight',
        duration: 6,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleMarkAsRead = () => {
    setUnreadCount(0);
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const items = [{ label: 'Home', link: '/' }];
    if (path.includes('admin-dashboard')) {
      items.push({ label: 'Admin Dashboard', link: '/admin-dashboard' });
    } else if (path.includes('teacher-dashboard')) {
      items.push({ label: 'Giảng viên Dashboard', link: '/teacher-dashboard' });
    } else if (path.includes('students')) {
      items.push({ label: 'Sinh viên', link: '/students' });
    } else if (path.includes('teachers')) {
      items.push({ label: 'Giảng viên', link: '/teachers' });
    } else if (path.includes('attendance-monitor')) {
      items.push({ label: 'Lớp học', link: '/attendance-monitor' });
      items.push({
        label: 'Điểm danh Lập trình Web',
        link: '/attendance-monitor',
      });
    } else if (path.includes('devices')) {
      items.push({ label: 'Thiết bị', link: '/devices' });
    } else if (path.includes('reports')) {
      items.push({ label: 'Báo cáo', link: '/reports' });
    } else {
      items.push({ label: 'Trang chủ', link: '/' });
    }

    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  const profileMenuItems: MenuProps['items'] = [
    {
      key: 'info',
      label: (
        <div className="px-1 py-1.5 border-b border-outline-variant/30 min-w-[160px]">
          <p className="font-semibold text-on-surface text-sm">
            {user?.fullName}
          </p>
          <p className="text-xs text-on-surface-variant">{user?.email}</p>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      danger: true,
      label: (
        <button
          className="flex items-center gap-2 text-sm py-1"
          onClick={() => dispatch(logoutUser())}
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Đăng xuất</span>
        </button>
      ),
    },
  ];

  return (
    <header className="h-topbar-height fixed top-0 right-0 left-0 md:left-sidebar-width z-30 border-b border-outline-variant bg-surface/85 backdrop-blur-md flex justify-between items-center px-4 md:px-container-padding-desktop">
      {/* Left: Hamburger menu (mobile) & Breadcrumbs (desktop) */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebarMobile}
          className="md:hidden p-2 text-on-surface-variant rounded-full hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="hidden md:flex items-center gap-2 text-on-surface-variant font-medium text-xs">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-outline">/</span>}
              {idx === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-primary">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.link}
                  className="hover:text-primary transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile Title */}
        <div className="md:hidden font-bold text-on-surface text-base">
          FaceAttend
        </div>
      </div>

      {/* Right: Actions & User Info */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Notifications */}
        <Dropdown
          placement="bottomRight"
          trigger={['click']}
          dropdownRender={() => (
            <div className="bg-surface-container-lowest border border-outline-variant shadow-xl rounded-xl p-4 min-w-[320px] max-w-[360px] mt-2">
              <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30 mb-3">
                <span className="font-semibold text-on-surface text-sm">
                  Thông báo
                </span>
                <span
                  onClick={handleMarkAsRead}
                  className="text-xs text-primary font-medium cursor-pointer hover:underline"
                >
                  Đánh dấu đã đọc
                </span>
              </div>
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-4">
                    Không có thông báo mới
                  </p>
                ) : (
                  notifications.map((notif) => {
                    let icon = 'notifications';
                    let iconColorClass = 'text-primary bg-primary-container/20';
                    if (notif.type === 'attendance') {
                      icon = 'error';
                      iconColorClass = 'text-error bg-error-container/20';
                    } else if (notif.type === 'info') {
                      icon = 'check_circle';
                      iconColorClass =
                        'text-secondary bg-secondary-container/20';
                    } else if (notif.type === 'sync') {
                      icon = 'sync';
                      iconColorClass = 'text-primary bg-primary/10';
                    }

                    return (
                      <div
                        key={notif.id}
                        className="flex gap-3 py-2 border-b border-outline-variant/10 last:border-0"
                      >
                        <span
                          className={`material-symbols-outlined ${iconColorClass} p-2 rounded-lg h-max text-[20px]`}
                        >
                          {icon}
                        </span>
                        <div className="text-left">
                          <p className="text-xs font-semibold text-on-surface">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5 whitespace-pre-line">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-on-surface-variant/70 mt-1">
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        >
          <button className="p-2 text-on-surface-variant rounded-full hover:bg-surface-container-low transition-colors relative flex items-center justify-center">
            <Badge
              count={unreadCount}
              overflowCount={99}
              color="#ba1a1a"
              offset={[-2, 2]}
            >
              <span className="material-symbols-outlined text-[22px]">
                notifications
              </span>
            </Badge>
          </button>
        </Dropdown>

        <div className="h-8 w-[1px] bg-outline-variant hidden sm:block"></div>

        {/* User Profile Dropdown */}
        <Dropdown
          menu={{ items: profileMenuItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <div className="flex items-center gap-3 cursor-pointer hover:bg-surface-container-low p-1 rounded-full transition-colors">
            <span className="font-label-lg text-label-lg text-on-surface font-semibold hidden lg:block">
              {user?.fullName}
            </span>
            <span className="material-symbols-outlined text-on-surface-variant hidden lg:block text-[18px]">
              expand_more
            </span>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};
export default Header;
