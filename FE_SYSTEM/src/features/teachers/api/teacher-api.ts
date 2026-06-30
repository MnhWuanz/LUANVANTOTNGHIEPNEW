import { axiosCilent } from '@/shared/lib/axios';
import type { TeacherFilterParams } from '../types/teacher-filter-params-type';

export const getTeachersOptions = async () => {
  const res = await axiosCilent.get('/teachers/options', {});

  return res.data;
};

/* ROLE ADMIN */
export const teacherRoleAdminApi = {
  getAll: async (params: TeacherFilterParams) => {
    const res = await axiosCilent.get('/teachers', { params });

    return res.data;
  },

  create: async (payload: any) => {
    const res = await axiosCilent.post('/teachers', payload);

    return res.data;
  },

  update: async (id: string, payload: any) => {
    const res = await axiosCilent.patch(`/teachers/${id}`, payload);

    return res.data;
  },
};

/* ROLE TEACHER */
export const teacherRoleTeacherApi = {
  update: async (payload: any) => {
    const res = await axiosCilent.patch('/teachers/me', payload);

    return res.data;
  },  
};
