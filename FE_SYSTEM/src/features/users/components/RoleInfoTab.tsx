import EmptyCustom from '@/shared/components/empty/EmptyCustom';
import TeacherInfoForm from './TeacherInfoForm';
import { useAppSelector } from '@/app/redux/hooks';
import { USER_ROLE } from '../types/user-role-type';

const RoleInfoTab = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) return null;

  switch (user?.role) {
    case USER_ROLE.TEACHER:
      if (!user.teacher) return null;
      return <TeacherInfoForm teacher={user.teacher} />;

    default:
      return <EmptyCustom title="Không có thông tin bổ sung" />;
  }
};

export default RoleInfoTab;
