import { Request, Response } from 'express';
import { StudentPortalService } from 'services/student_portal.service';
import {
  StudentPortalAttendanceParamsSchema,
  StudentPortalAttendanceQuerySchema,
} from 'validation/student_portal.validation';

const getStudentAttendance = async (req: Request, res: Response) => {
  const paramsResult = StudentPortalAttendanceParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid student portal attendance params',
      errors: paramsResult.error.flatten(),
    });
  }

  const queryResult = StudentPortalAttendanceQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid student portal attendance query',
      errors: queryResult.error.flatten(),
    });
  }

  try {
    const attendance =
      await StudentPortalService.getStudentAttendanceByCourse({
        studentCode: paramsResult.data.studentCode,
        ...queryResult.data,
      });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Get student attendance successfully',
      data: attendance,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Get student attendance failed';

    return res.status(500).json({
      success: false,
      message,
    });
  }
};

export const StudentPortalController = {
  getStudentAttendance,
};
