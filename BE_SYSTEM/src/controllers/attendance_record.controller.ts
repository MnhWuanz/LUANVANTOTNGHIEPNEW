import { Request, Response } from 'express';
import {
  AttendanceCheckInError,
  AttendanceRecordService,
} from 'services/attendance_record.service';

const checkIn = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Thieu file anh diem danh',
    });
  }

  try {
    const result = await AttendanceRecordService.checkInByFace({
      imageBuffer: req.file.buffer,
      deviceCode: req.headers['x-kiosk-device-code'],
      deviceToken: req.headers['x-kiosk-token'],
    });

    return res.status(result.duplicate ? 200 : 201).json({
      success: true,
      message: result.duplicate
        ? 'Sinh vien da diem danh trong phien nay'
        : 'Diem danh thanh cong',
      data: result,
    });
  } catch (error) {
    if (error instanceof AttendanceCheckInError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    const message =
      error instanceof Error ? error.message : 'Diem danh that bai';

    return res.status(500).json({
      success: false,
      message,
    });
  }
};
export const AttendanceRecordController = {
  checkIn,
};
