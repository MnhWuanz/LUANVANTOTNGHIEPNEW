import { Request, Response } from 'express';
import { UserService } from 'services/user.service';

const getAllUser = async (req: Request, res: Response) => {
  try {
    const result = await UserService.getAllUser();
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'Get all users successfully',
        data: result,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
const getTeacherById = async (req: Request, res: Response) => {
  try {
    const { id_teacher } = req.params;
    const result = await UserService.getTeacherById(Number(id_teacher));
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'Get teacher by id successfully',
        data: result,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

const updateTeacher = async (req: Request, res: Response) => {
  const id_teacher = Number(req.params.id_teacher);

  const result = await UserService.updateTeacher(id_teacher, req.body);

  return res.status(200).json({
    success: true,
    message: 'Update teacher successfully',
    data: result,
  });
};
const updateMyTeacher = async (req: Request, res: Response) => {
  const id_user = req.user?.id_user;

  if (!id_user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  const teacher = await UserService.getTeacherByUserId(id_user);
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: 'Teacher not found',
    });
  }

  const result = await UserService.updateTeacher(teacher.id_teacher, req.body);

  return res.status(200).json({
    success: true,
    message: 'Update my teacher successfully',
    data: result,
  });
};
export const UserController = {
  getAllUser,
  getTeacherById,
  updateTeacher,
  updateMyTeacher,
};

