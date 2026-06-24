import type { User } from '@/features/users/types/user-type';

export interface Student extends User {
  id: string;

  userId: string;

  // mã học viên
  studentCode: string;

  // phụ huynh
  parentName?: string | null;
  parentPhone?: string | null;

  // trường / lớp
  schoolName?: string | null;
  grade?: string | null;

  // học lực
  entryAcademicLevel?: string | null;

  // điểm test
  latestTestScore?: number | null;

  // mục tiêu học
  learningGoal?: string | null;

  // ghi chú
  note?: string | null;

  // ngày tham gia
  joinedAt?: string | null;
}
