import { axiosCilent } from '@/shared/lib/axios';
import type { SyncBatch } from '../types/sync-type';

interface RawSyncBatch {
  id_sync_batch: number;
  total_records: number;
  total_created: number;
  total_updated: number;
  summary: SyncBatch['summary'];
  synced_at: string;
}

const normalizeSyncBatch = (item: RawSyncBatch): SyncBatch => ({
  ...item,
  id: item.id_sync_batch,
  total_records: Number(item.total_records || 0),
  total_created: Number(item.total_created || 0),
  total_updated: Number(item.total_updated || 0),
});

export const syncBatchApi = {
  getAll: async (): Promise<SyncBatch[]> => {
    const res = await axiosCilent.get('/sync-batches');
    const items: RawSyncBatch[] = Array.isArray(res.data.data) ? res.data.data : [];

    return items
      .map(normalizeSyncBatch)
      .sort(
        (a, b) =>
          new Date(b.synced_at).getTime() - new Date(a.synced_at).getTime(),
      );
  },
};
