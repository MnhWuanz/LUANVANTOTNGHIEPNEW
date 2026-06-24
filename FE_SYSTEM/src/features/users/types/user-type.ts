import type { Student } from '@/features/students/types/student-type';
import type { UserStatusType } from '@/features/users/types/user-status-type';
import type { UserRole } from '@/features/users/types/user-role-type';
import type { UserGenderType } from '@/features/users/types/user-gender-type';
import type { Teacher } from '@/features/teachers/types/teacher-type';

export type User = {
  id: string;

  email: string;

  password: string;

  fullName?: string | null;

  phone?: string | null;

  address?: string | null;

  avatarUrl?: string | null;

  gender?: UserGenderType | null;

  dateOfBirth?: string | null;

  lastLoginAt?: string | null;

  role: UserRole;

  status: UserStatusType;

  createdAt: string;

  updatedAt: string;

  student?: Student | null;

  teacher?: Teacher | null;
};
