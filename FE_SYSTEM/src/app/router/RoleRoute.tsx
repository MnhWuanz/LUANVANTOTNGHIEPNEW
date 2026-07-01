import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/redux/hooks';
import type { UserRole } from '@/features/users/types/user-role-type';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
