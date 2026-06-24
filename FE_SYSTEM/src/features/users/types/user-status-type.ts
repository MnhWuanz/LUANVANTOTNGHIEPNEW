export const USER_STATUS = {
  ACTIVE: 'ACTIVE',

  INACTIVE: 'INACTIVE',

  DELETED: 'DELETED',
} as const;

export type UserStatusType = (typeof USER_STATUS)[keyof typeof USER_STATUS];
