import { Request, Response } from 'express';
import {
  AttendanceCheckInError,
  AttendanceRecordService,
} from 'services/attendance_record.service';

const checkIn = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message:
        'Thieu anh diem danh. Gui multipart/form-data voi field file, image, photo hoac faceImage',
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

const getCurrentKioskSession = async (req: Request, res: Response) => {
  try {
    const result = await AttendanceRecordService.getCurrentKioskSession({
      deviceCode: req.headers['x-kiosk-device-code'],
      deviceToken: req.headers['x-kiosk-token'],
    });

    return res.status(200).json({
      success: true,
      message: result.hasSession
        ? 'Co phien diem danh dang mo'
        : 'Khong co phien diem danh dang mo',
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
      error instanceof Error
        ? error.message
        : 'Kiem tra phien diem danh that bai';

    return res.status(500).json({
      success: false,
      message,
    });
  }
};

const getTodayKioskSessions = async (req: Request, res: Response) => {
  try {
    const result = await AttendanceRecordService.getTodayKioskSessions({
      deviceCode: req.headers['x-kiosk-device-code'],
      deviceToken: req.headers['x-kiosk-token'],
    });

    return res.status(200).json({
      success: true,
      message: result.hasSessionToday
        ? 'Hom nay co phien diem danh tai phong cua kiosk'
        : 'Hom nay khong co phien diem danh tai phong cua kiosk',
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
      error instanceof Error
        ? error.message
        : 'Kiem tra phien diem danh trong ngay that bai';

    return res.status(500).json({
      success: false,
      message,
    });
  }
};

export const AttendanceRecordController = {
  checkIn,
  getCurrentKioskSession,
  getTodayKioskSessions,
};
