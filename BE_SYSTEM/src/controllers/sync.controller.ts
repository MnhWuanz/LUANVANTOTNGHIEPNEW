import { SyncService } from 'services/sync.service';
import { Request, Response } from 'express';
import { TrainingSyncCourseClassesSchema } from 'validation/sync.validation';
import { prisma } from 'config/client';
function countTotalCreated(summary: Record<string, any>) {
  return Object.values(summary).reduce((total, item: any) => {
    return total + (item.created ?? 0);
  }, 0);
}

function countTotalUpdated(summary: Record<string, any>) {
  return Object.values(summary).reduce((total, item: any) => {
    return total + (item.updated ?? 0);
  }, 0);
}
const syncData = async (req: Request, res: Response) => {
  const result = TrainingSyncCourseClassesSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đồng bộ không hợp lệ',
      errors: result.error.flatten(),
    });
  }
  try {
    const result_sync = await SyncService(result.data);
    const totalCreated = countTotalCreated(result_sync.summary);
    const totalUpdated = countTotalUpdated(result_sync.summary);
    const totalRecords = totalCreated + totalUpdated;

    await prisma.sync_Batch.create({
      data: {
        total_records: totalRecords,
        total_created: totalCreated,
        total_updated: totalUpdated,
        summary: result_sync.summary,
        synced_at: new Date(),
      },
    });
    return res.status(200).json({
      success: true,
      message: 'Đồng bộ dữ liệu thành công',
      error: null,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Lỗi đồng bộ không xác định';
    return res.status(500).json({
      success: false,
      message: 'Đồng bộ dữ liệu thất bại',
      error: errorMessage,
    });
  }
};
const getSynBathches = async (req: Request, res: Response) => {
  const syncBatches = await prisma.sync_Batch.findMany({
    orderBy: {
      synced_at: 'desc',
    },
  });
  return res.status(200).json({
    success: true,
    message: 'Lấy danh sách đồng bộ thành công',
    data: syncBatches,
  });
};
export const SyncController = {
  syncData,
  getSynBathches,
};
