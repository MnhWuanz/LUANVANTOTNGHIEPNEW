import type { User } from '@/features/users/types/user-type';

export interface Teacher extends User {
  id_teacher: string;

  id_user: string;
  full_name:string|null
  teacher_code: string;
}
