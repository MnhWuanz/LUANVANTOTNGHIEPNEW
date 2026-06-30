import { axiosCilent } from "@/shared/lib/axios";

/* ROLE ADMIN */
export const userRoleAdminApi = {
  changeStatus: async (userId: string) => {
    const res = await axiosCilent.patch(`/users/${userId}/change-status`);

    return res.data;
  },

  remove: async (userId: string) => {
    const res = await axiosCilent.delete(`/users/${userId}`);

    return res.data;
  },
};

/* ROLE TEACHER */
export const userRoleTeacherApi = {
  updateTeacher: async (payload: any) => {
    const res = await axiosCilent.patch('/teachers/me', payload);

    return res.data;
  },
};
