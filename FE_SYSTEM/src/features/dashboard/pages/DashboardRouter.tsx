import { useAppSelector } from '@/app/redux/hooks';
import { USER_ROLE } from '@/features/users/types/user-role-type';
import DashBoardPage from '@/features/dashboard/pages/DashBoard';
import TeacherDashBoard from '@/features/dashboard/pages/TeacherDashBoard';

const DashboardRouter = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (user?.role === USER_ROLE.TEACHER) {
    return <TeacherDashBoard />;
  }

  // ADMIN hoặc mặc định
  return <DashBoardPage />;
};

export default DashboardRouter;
