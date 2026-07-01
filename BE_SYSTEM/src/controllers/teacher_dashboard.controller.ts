import { Request, Response } from 'express';
import { TeacherDashboardService } from 'services/teacher_dashboard.service';

const getTeacherDashboard = async (req: Request, res: Response) => {
  if (!req.user?.id_user) {
    return res.status(401).json({
      success: false,
      message: 'Chưa đăng nhập',
    });
  }

  try {
    const dashboard = await TeacherDashboardService.getTeacherDashboard(
      req.user.id_user,
    );

    if (!dashboard) {
      return res.status(403).json({
        success: false,
        message: 'Không tìm thấy thông tin giảng viên',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy dữ liệu dashboard thành công',
      data: dashboard,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const TeacherDashboardController = {
  getTeacherDashboard,
};
