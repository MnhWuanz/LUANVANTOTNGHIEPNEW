export type TeacherStatus = 'ACTIVE' | 'INACTIVE';

export interface Teacher {
  id: number;
  id_user: number;
  id_teacher: number;
  email: string;
  role: 'TEACHER' | 'ADMIN';
  is_active: boolean;
  status: TeacherStatus;
  statusText: string;
  last_login: string | null;
  createdAt: string;
  full_name: string;
  teacher_code: string;
}

export interface UpdateTeacherPayload {
  full_name?: string;
  teacher_code?: string;
  email?: string;
  password?: string;
}
