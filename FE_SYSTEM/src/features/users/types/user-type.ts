
import type { UserRole } from '@/features/users/types/user-role-type';
import type { Teacher } from '@/features/teachers/types/teacher-type';

export type User = {
  id_user: string;
  email: string;
  full_name?: string | null;
  role: UserRole;
  password?: string;
  confirm_password?: string;
  teacher?: Teacher | null;
};
