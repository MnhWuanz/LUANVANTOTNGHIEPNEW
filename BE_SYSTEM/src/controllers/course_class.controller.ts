import { Request, Response } from 'express';
import { CourseClassService } from 'services/course_class.service';

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

const getStudentsByCourseClass = async (req: Request, res: Response) => {
  const courseClassId = Number(req.params.courseClassId);

  if (!Number.isInteger(courseClassId) || courseClassId <= 0) {
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

export const CourseClassController = {
  getMyCourseClasses,
  getStudentsByCourseClass,
};
