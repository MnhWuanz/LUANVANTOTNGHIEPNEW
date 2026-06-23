import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface AppLayoutProps {
  role: 'admin' | 'teacher';
  setRole: React.Dispatch<React.SetStateAction<'admin' | 'teacher'>>;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ role, setRole, children }) => {
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const location = useLocation();

  // Nếu là trang login, render nội dung con không kèm sidebar và header
  if (location.pathname === '/login') {
    return <>{children}</>;
  }

  const handleToggleRole = () => {
    setRole((prev) => (prev === 'admin' ? 'teacher' : 'admin'));
  };

  return (
    <div className="min-h-screen bg-background font-be-vietnam text-on-background flex">
      {/* Sidebar Navigation */}
      <Sidebar
        role={role}
        isOpenMobile={isOpenMobileSidebar}
        onCloseMobile={() => setIsOpenMobileSidebar(false)}
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col md:ml-sidebar-width min-h-screen overflow-hidden">
        {/* Top Navbar */}
        <Header
          role={role}
          onToggleRole={handleToggleRole}
          onToggleSidebarMobile={() =>
            setIsOpenMobileSidebar(!isOpenMobileSidebar)
          }
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 mt-topbar-height p-6 md:p-container-padding-desktop overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
