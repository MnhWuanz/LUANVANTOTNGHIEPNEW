import { prisma } from 'config/client';

const getTeacherByUserId = async (id_user: number) => {
  return prisma.teacher.findUnique({
    where: { id_user },
    select: {
      id_teacher: true,
      full_name: true,
      teacher_code: true,
    },
  });
};
export const TeacherService = {
  getTeacherByUserId,
};
