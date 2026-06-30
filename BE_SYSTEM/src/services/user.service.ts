import { prisma } from 'config/client';
import { hashPassword } from 'src/utils/password.util';
type UpdateTeacherInput = {
  full_name?: string;
  teacher_code?: string;
  email?: string;
  password?: string;
};
const USER_WITH_TEACHER_INCLUDE = {
  teachers: {
    select: {
      id_teacher: true,
      full_name: true,
      teacher_code: true,
    },
  },
} as const;
const USER_WITH_GETALL = {
  select: {
    id_user: true,
    email: true,
    role: true,
    is_active: true,
    last_login: true,
    createdAt: true,
    teachers: {
      select: {
        id_teacher: true,
        full_name: true,
        teacher_code: true,
      },
    },
  },
};

const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    include: USER_WITH_TEACHER_INCLUDE,
  });
};

const findUserByID = async (id: number) => {
  return prisma.user.findUnique({
    where: { id_user: id },
    include: USER_WITH_TEACHER_INCLUDE,
  });
};
const getAllUser = () => {
  return prisma.user.findMany({
    ...USER_WITH_GETALL,
    where: { role: 'TEACHER' },
  });
};
const getTeacherById = async (id: number) => {
  return prisma.teacher.findUnique({
    where: { id_teacher: id },
    select: {
      id_teacher: true,
      full_name: true,
      teacher_code: true,
    },
  });
};
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

const updateTeacher = async (id_teacher: number, data: UpdateTeacherInput) => {
  const teacherData: any = {};
  const userData: any = {};

  if (data.full_name !== undefined) {
    teacherData.full_name = data.full_name;
  }

  if (data.teacher_code !== undefined) {
    teacherData.teacher_code = data.teacher_code;
  }

  if (data.email !== undefined) {
    userData.email = data.email;
  }

  if (data.password !== undefined) {
    userData.password_hash = await hashPassword(data.password);
  }

  if (Object.keys(userData).length > 0) {
    teacherData.user = {
      update: userData,
    };
  }

  return prisma.teacher.update({
    where: { id_teacher },
    data: teacherData,
    select: {
      id_teacher: true,
      full_name: true,
      teacher_code: true,
      user: {
        select: {
          id_user: true,
          email: true,
          role: true,
          is_active: true,
        },
      },
    },
  });
};
export const UserService = {
  getAllUser,
  findUserByEmail,
  findUserByID,
  getTeacherById,
  getTeacherByUserId,
  updateTeacher,
};

