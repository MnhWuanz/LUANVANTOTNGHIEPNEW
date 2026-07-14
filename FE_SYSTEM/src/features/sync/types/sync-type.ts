import type { FilterParams } from '@/shared/types/filter-params-type';

export interface SyncSummaryCount {
  created?: number;
  updated?: number;
}

export type SyncBatchSummary = Record<string, SyncSummaryCount | undefined>;

export interface SyncBatch {
  id: number;
  id_sync_batch: number;
  total_records: number;
  total_created: number;
  total_updated: number;
  summary: SyncBatchSummary | null;
  synced_at: string;
}

export interface SyncBatchFilterParams extends FilterParams {
  startDate?: string;
  endDate?: string;
}
