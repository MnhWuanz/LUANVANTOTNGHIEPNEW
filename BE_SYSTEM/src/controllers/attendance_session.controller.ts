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

function parsePositiveInteger(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number(rawValue);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
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

const cancelSession = async (req: Request, res: Response) => {
  const attendanceSessionId = parsePositiveInteger(req.params.id);

  if (!attendanceSessionId) {
    return res.status(400).json({
      success: false,
      message: 'ID phiên điểm danh không hợp lệ',
    });
  }

  const { reason } = req.body;

  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Lý do hủy là bắt buộc',
    });
  }

  try {
    const result = await AttendanceSessionService.cancelAttendanceSession({
      attendanceSessionId,
      reason: reason.trim(),
    });

    if ('error' in result) {
      const errorMessages: Record<string, { status: number; message: string }> = {
        NOT_FOUND: { status: 404, message: 'Không tìm thấy phiên điểm danh' },
        ALREADY_CLOSED: { status: 409, message: 'Phiên đã đóng, không thể hủy' },
        ALREADY_CANCELLED: { status: 409, message: 'Phiên đã bị hủy trước đó' },
      };

      const err = errorMessages[result.error] ?? { status: 400, message: 'Lỗi không xác định' };

      return res.status(err.status).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Hủy phiên điểm danh thành công',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Hủy phiên thất bại';
    return res.status(500).json({ success: false, message });
  }
};

const createManualSession = async (req: Request, res: Response) => {
  const { idCourseSchedule, sessionDate, reason } = req.body;

  if (!idCourseSchedule || typeof idCourseSchedule !== 'number' || idCourseSchedule <= 0) {
    return res.status(400).json({
      success: false,
      message: 'idCourseSchedule không hợp lệ',
    });
  }

  if (!sessionDate || typeof sessionDate !== 'string' || !isValidDateOnly(sessionDate)) {
    return res.status(400).json({
      success: false,
      message: 'sessionDate phải có định dạng YYYY-MM-DD',
    });
  }

  try {
    const result = await AttendanceSessionService.createManualAttendanceSession({
      idCourseSchedule,
      sessionDate,
      reason: typeof reason === 'string' ? reason.trim() || undefined : undefined,
    });

    if ('error' in result) {
      const errorMessages: Record<string, { status: number; message: string }> = {
        SCHEDULE_NOT_FOUND: { status: 404, message: 'Không tìm thấy lịch học' },
        ALREADY_EXISTS: { status: 409, message: 'Phiên điểm danh đã tồn tại cho ngày này' },
        SCHEDULE_CONFLICT: { status: 409, message: 'Trùng lịch với phiên khác trong cùng phòng' },
      };

      const err = errorMessages[result.error] ?? { status: 400, message: 'Lỗi không xác định' };

      return res.status(err.status).json({
        success: false,
        message: err.message,
        ...('conflicts' in result ? { conflicts: result.conflicts } : {}),
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Tạo phiên điểm danh bù thành công',
      data: result.session,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tạo phiên bù thất bại';
    return res.status(500).json({ success: false, message });
  }
};

const checkConflicts = async (req: Request, res: Response) => {
  const { idCourseSchedule, sessionDate } = req.body;

  if (!idCourseSchedule || typeof idCourseSchedule !== 'number' || idCourseSchedule <= 0) {
    return res.status(400).json({
      success: false,
      message: 'idCourseSchedule không hợp lệ',
    });
  }

  if (!sessionDate || typeof sessionDate !== 'string' || !isValidDateOnly(sessionDate)) {
    return res.status(400).json({
      success: false,
      message: 'sessionDate phải có định dạng YYYY-MM-DD',
    });
  }

  try {
    const result = await AttendanceSessionService.checkScheduleConflicts({
      idCourseSchedule,
      sessionDate,
    });

    if ('error' in result) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch học',
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Kiểm tra trùng lịch thất bại';
    return res.status(500).json({ success: false, message });
  }
};

const getAllCourseSchedules = async (_req: Request, res: Response) => {
  try {
    const schedules = await AttendanceSessionService.getAllCourseSchedules();

    return res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lấy danh sách lịch học thất bại';
    return res.status(500).json({ success: false, message });
  }
};

export const AttendanceSessionController = {
  generateSession,
  getAllSessions,
  cancelSession,
  createManualSession,
  checkConflicts,
  getAllCourseSchedules,
};
