import { Request, Response } from 'express';
import { CourseClassService } from 'services/course_class.service';

function parsePositiveInteger(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number(rawValue);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

const getMyCourseClasses = async (req: Request, res: Response) => {
  if (!req.user?.id_user) {
    return res.status(401).json({
      success: false,
      message: 'Chưa đăng nhập',
    });
  }

  try {
    const courseClasses =
      await CourseClassService.getCourseClassesByTeacherUserId(
        req.user.id_user,
      );

    return res.json({
      success: true,
      data: courseClasses,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Lấy danh sách lớp học phần thất bại';

    return res.status(500).json({
      success: false,
      message,
    });
  }
};

const getCourseClassSchedules = async (req: Request, res: Response) => {
  const courseClassId = parsePositiveInteger(req.params.courseClassId);

  if (!courseClassId) {
    return res.status(400).json({
      success: false,
      message: 'courseClassId không hợp lệ',
    });
  }

  if (!req.user?.id_user) {
    return res.status(401).json({
      success: false,
      message: 'Chưa đăng nhập',
    });
  }

  try {
    const schedules = await CourseClassService.getCourseClassSchedules(
      courseClassId,
      req.user.id_user,
    );

    if (schedules === null) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem lịch học của lớp học phần này',
      });
    }

    return res.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Lấy lịch học thất bại';

    return res.status(500).json({
      success: false,
      message,
    });
  }
};

const getStudentsByCourseClass = async (req: Request, res: Response) => {
  const courseClassId = parsePositiveInteger(req.params.courseClassId);

  if (!courseClassId) {
    return res.status(400).json({
      success: false,
      message: 'courseClassId không hợp lệ',
    });
  }

  if (!req.user?.id_user) {
    return res.status(401).json({
      success: false,
      message: 'Chưa đăng nhập',
    });
  }

  try {
    const students = await CourseClassService.getStudentsByCourseClassId(
      courseClassId,
      req.user.id_user,
    );

    if (students === null) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem sinh viên của lớp học phần này',
      });
    }

    return res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Lấy danh sách sinh viên thất bại';

    return res.status(500).json({
      success: false,
      message,
    });
  }
};

const getAttendanceSessionStudents = async (req: Request, res: Response) => {
  const attendanceSessionId = parsePositiveInteger(
    req.params.attendanceSessionId,
  );

  if (!attendanceSessionId) {
    return res.status(400).json({
      success: false,
      message: 'attendanceSessionId không hợp lệ',
    });
  }

  if (!req.user?.id_user) {
    return res.status(401).json({
      success: false,
      message: 'Chưa đăng nhập',
    });
  }

  try {
    const students = await CourseClassService.getAttendanceSessionStudents(
      attendanceSessionId,
      req.user.id_user,
    );

    if (students === null) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem phiên điểm danh này',
      });
    }

    return res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Lấy chi tiết điểm danh thất bại';

    return res.status(500).json({
      success: false,
      message,
    });
  }
};

export const CourseClassController = {
  getMyCourseClasses,
  getCourseClassSchedules,
  getStudentsByCourseClass,
  getAttendanceSessionStudents,
};
