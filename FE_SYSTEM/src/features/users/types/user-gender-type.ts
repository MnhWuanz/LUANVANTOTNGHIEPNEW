export const USER_GENDER = {
  MALE: 'MALE',

  FEMALE: 'FEMALE',

  OTHER: 'OTHER',
} as const;

export type UserGenderType = (typeof USER_GENDER)[keyof typeof USER_GENDER];
