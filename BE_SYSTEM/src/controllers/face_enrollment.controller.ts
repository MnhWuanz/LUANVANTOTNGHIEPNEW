import { Request, Response } from 'express';
import {
  FaceEnrollmentError,
  FaceEnrollmentService,
} from 'services/face_enrollment.service';

const enrollFace = async (req: Request, res: Response) => {
  const studentId = Number(req.params.studentId);

  if (!Number.isInteger(studentId) || studentId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'studentId không hợp lệ',
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu file ảnh đăng ký khuôn mặt',
    });
  }

  if (!req.user?.id_user) {
    return res.status(401).json({
      success: false,
      message: 'Chưa đăng nhập',
    });
  }
  try {
    const result = await FaceEnrollmentService.enrollStudentFace({
      teacherUserId: req.user.id_user,
      studentId,
      imageBuffer: req.file.buffer,
      mimeType: req.file.mimetype,
    });

    return res.status(201).json({
      success: true,
      message: 'Đăng ký khuôn mặt sinh viên thành công',
      data: result,
    });
  } catch (error) {
    if (error instanceof FaceEnrollmentError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    const message =
      error instanceof Error
        ? error.message
        : 'Đăng ký khuôn mặt sinh viên thất bại';

    return res.status(500).json({
      success: false,
      message,
    });
  }
};

export const FaceEnrollmentController = {
  enrollFace,
};
