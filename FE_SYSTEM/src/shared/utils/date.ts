import { FORMAT_DATE, FORMAT_TIME } from '@/shared/constants/format-date';
import dayjs, { Dayjs } from 'dayjs';
/**
 * Convert ISO string -> dayjs object
 * dùng cho DatePicker setFieldsValue
 */
export const formatDateToPicker = (value?: string | Date | null): Dayjs | null => {
  if (!value) return null;

  return dayjs(value);
};

/**
 * Convert dayjs -> YYYY-MM-DD
 * dùng cho query params
 */
export const formatDateToQuery = (value?: Dayjs | null): string | null => {
  if (!value) return null;

  return value.format('YYYY-MM-DD');
};

/**
 * Format hiển thị UI
 * vd: 12/05/2026
 */
export const formatDate = (value?: string | Date | null, format = FORMAT_DATE): string => {
  if (!value) return '';

  return dayjs(value).format(format);
};

/**
 * Convert string -> dayjs object
 * dùng cho TimePicker setFieldsValue
 */
export const formatTimeToPicker = (
  value?: string | Date | null,
  format = FORMAT_TIME,
): Dayjs | null => {
  if (!value) return null;

  return dayjs(value, format);
};
