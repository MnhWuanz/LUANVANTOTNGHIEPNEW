import type { User } from '@/features/users/types/user-type';

export interface Teacher extends User {
  id: string;

  userId: string;

  // mã giáo viên
  teacherCode: string;

  bio?: string | null;

  specialization?: string | null;

  qualification?: string | null;

  yearsOfExperience?: number | null;

  // ghi chú
  note?: string | null;

  // ngày tham gia
  joinedAt?: string | null;
}
