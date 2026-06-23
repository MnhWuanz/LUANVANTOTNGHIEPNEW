import { prisma } from 'config/client';
import bcrypt from 'bcrypt';
import { CreateUserInput, UpdateUserInput } from 'validation/user.validation';
import { UserRole } from '@prisma/client';

const SALT_ROUNDS = 10;

const USER_SELECT = {
  userId: true,
  email: true,
  role: true,
  teacherId: true,
  teacher: {
    select: {
      fullName: true,
      teacherCode: true,
    },
  },
} as const;

// Get all users
const getAllUsers = async () => {
  return prisma.user.findMany({
    select: USER_SELECT,
    orderBy: { userId: 'asc' },
  });
};

const searchUsersByRole = async (roleStr: string) => {
  const role = roleStr.toUpperCase() as UserRole;
  const total_items = await prisma.user.count({
    where: { role },
  });
  const users = await prisma.user.findMany({
    where: { role },
    select: USER_SELECT,
    orderBy: { userId: 'asc' },
  });
  return {
    users,
    total_items,
  };
};

// Get one user by userId
const getUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: { userId },
    select: USER_SELECT,
  });
};

// Create new user
const createUser = async (data: CreateUserInput) => {
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  let teacherId: string | undefined;

  // If role is teacher, create the profile first
  if (data.role === 'teacher') {
    const teacher = await prisma.teacher.create({
      data: {
        teacherId: `teacher_${Date.now()}`,
        fullName: data.name,
        email: data.email,
        teacherCode: data.code || `GV-${Date.now()}`,
      },
    });
    teacherId = teacher.teacherId;
  }

  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash: hashedPassword,
      role: data.role.toUpperCase() as UserRole,
      teacherId,
    },
    select: USER_SELECT,
  });
};

// Update user
const updateUser = async (userId: string, data: UpdateUserInput) => {
  const user = await prisma.user.findUnique({
    where: { userId },
  });
  if (!user) throw new Error('P2025'); // Prisma record not found error code to catch

  const updateData: any = {};
  if (data.email) updateData.email = data.email;
  if (data.role) updateData.role = data.role.toUpperCase() as UserRole;

  if (user.teacherId && (data.name || data.code)) {
    await prisma.teacher.update({
      where: { teacherId: user.teacherId },
      data: {
        fullName: data.name,
        teacherCode: data.code,
      },
    });
  }

  return prisma.user.update({
    where: { userId },
    data: updateData,
    select: USER_SELECT,
  });
};

// Delete user
const deleteUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { userId },
  });
  if (!user) throw new Error('P2025');

  // Delete user first
  await prisma.user.delete({
    where: { userId },
  });

  // Clean up teacher profile
  if (user.teacherId) {
    await prisma.teacher.delete({
      where: { teacherId: user.teacherId },
    });
  }
};

export const UserService = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsersByRole,
};
