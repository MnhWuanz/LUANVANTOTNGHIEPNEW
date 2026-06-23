import { Request, Response } from 'express';
import { SyncService, SyncPayload } from 'services/sync.service';
import {
  syncPayloadSchema,
  syncSinglePayloadSchema,
} from 'validation/sync.validation';
import { Server } from 'socket.io';
import { z } from 'zod';

const syncData = async (req: Request, res: Response) => {
  try {
    const isArray = Array.isArray(req.body);
    const schema = isArray
      ? z.array(syncSinglePayloadSchema)
      : syncPayloadSchema;
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Dữ liệu đồng bộ không hợp lệ',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const payloads = isArray
      ? (parsed.data as SyncPayload[])
      : [parsed.data as SyncPayload];
    const results = [];
    const io = req.app.get('io') as Server;

    for (const payload of payloads) {
      const result = await SyncService.sync(payload);
      results.push(result);

      if (io) {
        io.emit('sync-notification', {
          success: true,
          message:
            `🔄 Đồng bộ lớp học phần thành công!\n` +
            `• Mã lớp: ${result.classSection.classSectionId}\n` +
            `• Môn học: ${result.classSection.subjectName}\n` +
            `• Giảng viên: ${result.teacher.fullName}\n` +
            `• Phòng học: ${result.room.roomName}\n` +
            `• Sĩ số: ${result.studentCount} sinh viên`,
          timestamp: new Date().toISOString(),
          data: {
            classSectionId: result.classSection.classSectionId,
            subjectName: result.classSection.subjectName,
            teacherName: result.teacher.fullName,
            roomName: result.room.roomName,
            studentCount: result.studentCount,
          },
        });
      }
    }
    res.status(200).json({
      success: true,
      message: 'Đồng bộ dữ liệu thành công',
      data: isArray ? results : results[0],
    });
  } catch (error: any) {
    console.error('Lỗi đồng bộ dữ liệu:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đồng bộ dữ liệu',
      error: error.message || error,
    });
  }
};

export const SyncController = {
  syncData,
};
