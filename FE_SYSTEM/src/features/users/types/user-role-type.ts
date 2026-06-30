export const USER_ROLE = {
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
