import {
  AttendanceSessionService,
  generateAttendanceSession,
  updateAttendanceSessionStatuses,
} from 'services/attendance_session.service';
import { Request, Response } from 'express';

function isValidDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

const generateSession = async (req: Request, res: Response) => {
  const result = await generateAttendanceSession();
  const statusResult = await updateAttendanceSessionStatuses();
  if (result.totalSchedules === 0) {
    return res.status(200).json({
      success: true,
      message: 'Không có lịch học nào trong ngày hôm nay',
      data: {
        ...result,
        statusUpdated: statusResult,
      },
    });
  }
  return res.status(200).json({
    success: true,
    message: 'Tạo buổi điểm danh thành công',
    data: {
      ...result,
      statusUpdated: statusResult,
    },
  });
};
const getAllSessions = async (req: Request, res: Response) => {
  const dateParam = req.query.date as string | undefined;
  if (dateParam && !isValidDateOnly(dateParam)) {
    return res.status(400).json({
      success: false,
      message: 'date phải có định dạng YYYY-MM-DD',
    });
  }

  const statusResult = await updateAttendanceSessionStatuses();
  const result =
    await AttendanceSessionService.getAllAttendanceSessions(dateParam);

  return res.status(200).json({
    success: true,
    message: 'Lấy danh sách phiên điểm danh thành công',
    data: {
      date: dateParam ?? new Date().toLocaleDateString('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
      }),
      total: result.length,
      statusUpdated: statusResult,
      sessions: result,
    },
  });
};
export const AttendanceSessionController = {
  generateSession,
  getAllSessions,
};
