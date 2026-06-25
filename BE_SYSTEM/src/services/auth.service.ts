import { prisma } from 'config/client';

const AUTH_USER_SELECT = {
  id_user: true,
  email: true,
  role: true,
  teachers: {
    select: {
      id_teacher: true,
      full_name: true,
      teacher_code: true,
    },
  },
} as const;

const updateUserLogin = async (userId: number, hashedRefreshToken: string) => {
  return prisma.user.update({
    where: {
      id_user: userId,
    },
    data: {
      refresh_token_hash: hashedRefreshToken,
      last_login: new Date(),
    },
    select: AUTH_USER_SELECT,
  });
};

const updateUserLogout = async (userId: number) => {
  return prisma.user.update({
    where: {
      id_user: userId,
    },
    data: {
      refresh_token_hash: null,
    },
  });
};

export const authService = {
  updateUserLogin,
  updateUserLogout,
};
