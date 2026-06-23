import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { useAppDispatch, useAppSelector } from './store/hook';
import { refreshUser } from './store/slices/authSlice';

// Layout
import AppLayout from './layouts/AppLayout';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AttendanceMonitor from './pages/AttendanceMonitor';
import StudentManagement from './pages/StudentManagement';
import PlaceholderPage from './pages/PlaceholderPage';

function App() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [role, setRole] = useState<'admin' | 'teacher'>('admin');

  // Khôi phục phiên làm việc khi khởi chạy ứng dụng
  useEffect(() => {
    dispatch(refreshUser())
      .unwrap()
      .then((userPayload) => {
        if (userPayload) {
          setRole(userPayload.role.toLowerCase() as 'admin' | 'teacher');
        }
      })
      .catch(() => {
        // Chưa đăng nhập trước đó hoặc hết hạn phiên
      });
  }, [dispatch]);

  // Ant Design custom theme token mapping design system guidelines
  const customTheme = {
    token: {
      colorPrimary: '#3525cd',
      colorSuccess: '#006c49',
      colorWarning: '#684000',
      colorError: '#ba1a1a',
      colorBgBase: '#f8f9ff',
      colorBgContainer: '#ffffff',
      borderRadius: 8,
      fontFamily: 'Be Vietnam Pro, sans-serif',
      fontSize: 14,
    },
    components: {
      Button: {
        borderRadius: 8,
        controlHeight: 40,
        fontWeight: 600,
      },
      Input: {
        borderRadius: 8,
        controlHeight: 40,
      },
      Select: {
        borderRadius: 8,
        controlHeight: 40,
      },
      Table: {
        headerBg: '#e5eeff',
        headerColor: '#0b1c30',
        headerBorderRadius: 8,
        rowHoverBg: '#eff4ff',
      },
      Card: {
        borderRadius: 16,
      },
      Modal: {
        borderRadius: 16,
      },
    },
  };

  // Hiển thị màn hình chờ khi đang xác minh phiên (lần đầu tải trang)
  if (loading && !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Spin size="large" tip="Đang tải phiên đăng nhập..." />
      </div>
    );
  }

  return (
    <ConfigProvider theme={customTheme} locale={viVN}>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route - Nếu đã có user thì tự động vào trang chủ */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate
                  to={
                    role === 'admin' ? '/admin-dashboard' : '/teacher-dashboard'
                  }
                  replace
                />
              ) : (
                <Login setRole={setRole} />
              )
            }
          />

          {/* Authenticated Dashboard & Feature Routes - Route Guard */}
          <Route
            path="/*"
            element={
              user ? (
                <AppLayout role={role} setRole={setRole}>
                  <Routes>
                    {/* Đường dẫn mặc định chuyển đến dashboard dựa trên vai trò */}
                    <Route
                      path="/"
                      element={
                        <Navigate
                          to={
                            role === 'admin'
                              ? '/admin-dashboard'
                              : '/teacher-dashboard'
                          }
                          replace
                        />
                      }
                    />

                    {/* Admin Dashboard */}
                    <Route
                      path="/admin-dashboard"
                      element={<AdminDashboard />}
                    />

                    {/* Teacher Dashboard */}
                    <Route
                      path="/teacher-dashboard"
                      element={<TeacherDashboard />}
                    />

                    {/* Student Management */}
                    <Route path="/students" element={<StudentManagement />} />

                    {/* Attendance Monitor */}
                    <Route
                      path="/attendance-monitor"
                      element={<AttendanceMonitor />}
                    />

                    {/* Placeholder paths for remaining sidebar pages */}
                    <Route
                      path="/teachers"
                      element={
                        <PlaceholderPage
                          title="Quản lý Giảng viên"
                          iconName="record_voice_over"
                          description="Trang quản lý hồ sơ giảng viên, phân quyền truy cập và phân công giảng dạy các lớp học phần."
                        />
                      }
                    />
                    <Route
                      path="/devices"
                      element={
                        <PlaceholderPage
                          title="Quản lý Thiết bị"
                          iconName="android_fingerprint"
                          description="Cấu hình, giám sát trạng thái trực tuyến (online/offline) và đồng bộ dữ liệu cho các máy quét Kiosk điểm danh."
                        />
                      }
                    />
                    <Route
                      path="/reports"
                      element={
                        <PlaceholderPage
                          title="Báo cáo thống kê"
                          iconName="assessment"
                          description="Xuất báo cáo điểm danh học kỳ, thống kê tỷ lệ chuyên cần của sinh viên và lịch sử hoạt động hệ thống."
                        />
                      }
                    />

                    {/* Fallback cho route không hợp lệ */}
                    <Route
                      path="*"
                      element={
                        <Navigate
                          to={
                            role === 'admin'
                              ? '/admin-dashboard'
                              : '/teacher-dashboard'
                          }
                          replace
                        />
                      }
                    />
                  </Routes>
                </AppLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
