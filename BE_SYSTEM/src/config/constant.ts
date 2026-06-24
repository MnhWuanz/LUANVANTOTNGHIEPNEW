const STATUS_FACE_ENROLLMENT = {
  ACTIVE: 'active',
  REPLACED: 'replaced',
  FAILED: 'failed',
};

const STATUS_ATTENDANCE_SESSION = {
  NOT_STARTED: 'not_started',
  OPEN: 'open',
  CLOSED: 'closed',
};
const STATUS_ATTENDANCE_RECORD = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
};
const STATUS_KIOSK_DEVICE = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
};

export type TYPE_STATUS_FACE_ENROLLMENT = keyof typeof STATUS_FACE_ENROLLMENT;
export type TYPE_STATUS_ATTENDANCE_SESSION =
  keyof typeof STATUS_ATTENDANCE_SESSION;
export type TYPE_STATUS_ATTENDANCE_RECORD =
  keyof typeof STATUS_ATTENDANCE_RECORD;
export type TYPE_STATUS_KIOSK_DEVICE = keyof typeof STATUS_KIOSK_DEVICE;
