import { Navigate, Outlet } from 'react-router-dom';

import { useAppSelector } from '@/app/redux/hooks';
import { Spin } from 'antd';

interface ProtectedRouteProps {
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAuth = true }) => {
const { user,initialized } = useAppSelector((state) => state.auth);
  // Route cần login
   if (!initialized) {
    return (
      <Spin
        size="large"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      />
    );
  }
  if (requireAuth && !user) {
    return <Navigate to="/auth/login" replace />;
  }
  if(!requireAuth && user){
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
