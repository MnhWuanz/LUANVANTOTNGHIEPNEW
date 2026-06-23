import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface SidebarProps {
  role: 'admin' | 'teacher';
  onCloseMobile?: () => void;
  isOpenMobile: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, onCloseMobile, isOpenMobile }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: role === 'admin' ? '/admin-dashboard' : '/teacher-dashboard',
      icon: 'dashboard',
      label: 'Dashboard',
    },
    {
      path: '/students',
      icon: 'group',
      label: 'Sinh viên',
    },
    {
      path: '/teachers',
      icon: 'record_voice_over',
      label: 'Giảng viên',
    },
    {
      path: '/attendance-monitor',
      icon: 'school',
      label: 'Theo dõi điểm danh',
    },
    {
      path: '/devices',
      icon: 'android_fingerprint',
      label: 'Thiết bị',
    },
    {
      path: '/reports',
      icon: 'assessment',
      label: 'Báo cáo',
    },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col bg-surface-container-lowest border-r border-outline-variant py-6 px-4">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 pb-6 mb-4 border-b border-outline-variant/30">
        <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-primary shadow-sm">
          <span className="material-symbols-outlined fill-icon text-[24px]">face</span>
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary leading-tight">FaceAttend</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Hệ thống Điểm danh</p>
        </div>
      </div>

      {/* Role Indicator Badge */}
      <div className="mx-4 mb-6 px-3 py-2 rounded-lg bg-surface-container flex items-center gap-2 border border-outline-variant/50">
        <span className="material-symbols-outlined text-primary text-[18px]">
          {role === 'admin' ? 'admin_panel_settings' : 'school'}
        </span>
        <div className="text-left">
          <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">Vai trò hiện tại</p>
          <p className="text-xs font-semibold text-on-surface">
            {role === 'admin' ? 'Quản trị viên' : 'Giảng viên'}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1.5">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                isActive
                  ? 'bg-primary-container/10 text-primary font-semibold border border-primary/10 shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-transparent'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${isActive ? 'fill-icon' : ''}`}
              >
                {item.icon}
              </span>
              <span className="text-[14px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Footer Info */}
      <div className="mt-auto px-4 pt-4 border-t border-outline-variant/30 text-center">
        <p className="text-[11px] text-on-surface-variant">© 2026 FaceAttend System</p>
        <p className="text-[10px] text-primary/70 font-medium">v1.2.0 - Biometric Attendance</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (visible on md+) */}
      <aside className="w-[280px] h-screen fixed left-0 top-0 z-40 hidden md:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop (visible when open) */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Sidebar (slides in from left) */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[280px] z-50 md:hidden bg-surface-container-lowest transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
export default Sidebar;
