import type { FilterParams } from '@/shared/types/filter-params-type';
import type { TeacherStatus } from './teacher-type';

export interface TeacherFilterParams extends FilterParams {
  status?: TeacherStatus;
}
