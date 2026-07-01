import type { FilterParams } from '@/shared/types/filter-params-type';
import type { KioskStatus } from './kiosk-type';

export interface KioskFilterParams extends FilterParams {
  status?: KioskStatus;
}
