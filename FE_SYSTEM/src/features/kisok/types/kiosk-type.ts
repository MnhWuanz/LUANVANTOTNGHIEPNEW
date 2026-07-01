export const KIOSK_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED',
} as const;

export type KioskStatus = (typeof KIOSK_STATUS)[keyof typeof KIOSK_STATUS];

export const KIOSK_STATUS_LABEL: Record<KioskStatus, string> = {
  [KIOSK_STATUS.PENDING]: 'Chờ kích hoạt',
  [KIOSK_STATUS.ACTIVE]: 'Hoạt động',
  [KIOSK_STATUS.INACTIVE]: 'Ngưng hoạt động',
  [KIOSK_STATUS.BLOCKED]: 'Bị khóa',
};

export const KIOSK_STATUS_OPTIONS = Object.values(KIOSK_STATUS).map((status) => ({
  label: KIOSK_STATUS_LABEL[status],
  value: status,
}));

export interface KioskRoom {
  id_room: number;
  source_id_room: number;
  room_code: string;
  capacity: number;
}

export interface KioskActivationCode {
  id_activation_code: number;
  code: number;
  is_used: boolean;
  is_active: boolean;
  created_at: string;
  id_kiosk: number | null;
}

export interface Kiosk {
  id: number;
  id_kiosk: number;
  device_code: string;
  device_name: string;
  status: KioskStatus;
  is_active: boolean;
  activated_at: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
  id_room: number;
  room?: KioskRoom;
  room_code?: string;
  activationCodes?: KioskActivationCode[];
  latestActivationCode?: number | null;
}

export interface CreateKioskPayload {
  device_name: string;
  id_room: number;
}
