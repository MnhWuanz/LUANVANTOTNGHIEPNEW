import { axiosCilent } from '@/shared/lib/axios';
import { PAGE_DEFAULT, PAGE_LIMIT } from '@/shared/constants/pagination';
import type { TeacherFilterParams } from '../types/teacher-filter-params-type';
import type { Teacher, UpdateTeacherPayload } from '../types/teacher-type';

interface RawTeacherUser {
  id_user: number;
  email: string;
  role: 'TEACHER' | 'ADMIN';
  is_active: boolean;
  last_login: string | null;
  createdAt: string;
  teachers: {
    id_teacher: number;
    full_name: string;
    teacher_code: string;
  } | null;
}

const normalizeTeacher = (item: RawTeacherUser): Teacher | null => {
  if (!item.teachers) {
    return null;
  }

  return {
    id: item.teachers.id_teacher,
    id_user: item.id_user,
    id_teacher: item.teachers.id_teacher,
    email: item.email,
    role: item.role,
    is_active: item.is_active,
    status: item.is_active ? 'ACTIVE' : 'INACTIVE',
    statusText: item.is_active ? 'Hoạt động' : 'Ngưng hoạt động',
    last_login: item.last_login,
    createdAt: item.createdAt,
    full_name: item.teachers.full_name,
    teacher_code: item.teachers.teacher_code,
  };
};

const filterTeachers = (items: Teacher[], params: TeacherFilterParams) => {
  const keySearch = params.keySearch?.trim().toLowerCase();

  return items.filter((item) => {
    const matchesKeyword = keySearch
      ? [item.teacher_code, item.full_name, item.email]
          .some((value) => value.toLowerCase().includes(keySearch))
      : true;
    const matchesStatus = params.status ? item.status === params.status : true;

    return matchesKeyword && matchesStatus;
  });
};

export const getTeachersOptions = async () => {
  const res = await teacherRoleAdminApi.getAll({ page: 1, limit: 1000 });

  return res.data.items.map((teacher: Teacher) => ({
    label: `${teacher.full_name} (${teacher.teacher_code})`,
    value: teacher.id_teacher,
  }));
};

export const teacherRoleAdminApi = {
  getAll: async (params: TeacherFilterParams) => {
    const res = await axiosCilent.get('/users');
    const teachers = Array.isArray(res.data.data)
      ? res.data.data.map(normalizeTeacher).filter(Boolean) as Teacher[]
      : [];
    const filteredTeachers = filterTeachers(teachers, params);
    const page = Number(params.page || PAGE_DEFAULT);
    const limit = Number(params.limit || PAGE_LIMIT);
    const start = (page - 1) * limit;

    return {
      ...res.data,
      data: {
        items: filteredTeachers.slice(start, start + limit),
        pagination: {
          total: filteredTeachers.length,
          page,
          limit,
        },
      },
    };
  },

  update: async (idTeacher: number, payload: UpdateTeacherPayload) => {
    const res = await axiosCilent.patch(`/teachers/${idTeacher}`, payload);

    return res.data;
  },
};

export const teacherRoleTeacherApi = {
  update: async (payload: UpdateTeacherPayload) => {
    const res = await axiosCilent.patch('/teachers/me', payload);

    return res.data;
  },
};

