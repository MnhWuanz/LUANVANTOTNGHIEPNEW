import { Request, Response } from 'express';
import { UserService } from 'services/user.service';
import { createUserSchema, updateUserSchema } from 'validation/user.validation';

type ReqWithId = Request<{ id: string }>;

// GET /api/users
const getAll = async (req: Request, res: Response) => {
  try {
    const users = await UserService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// GET /api/users/:id
const getOne = async (req: ReqWithId, res: Response) => {
  try {
    const id = req.params.id;
    const user = await UserService.getUserById(id);

    if (!user) {
      res.status(404).json({ success: false, message: 'Không tìm thấy user' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/users
const create = async (req: Request, res: Response) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const user = await UserService.createUser(parsed.data);
    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: `${error.meta?.target} đã tồn tại`,
      });
      return;
    }
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// PUT /api/users/:id
const update = async (req: ReqWithId, res: Response) => {
  try {
    const id = req.params.id;

    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const user = await UserService.updateUser(id, parsed.data);
    res.json({ success: true, data: user });
  } catch (error: any) {
    if (error.code === 'P2025' || error.message === 'P2025') {
      res.status(404).json({ success: false, message: 'Không tìm thấy user' });
      return;
    }
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// DELETE /api/users/:id
const remove = async (req: ReqWithId, res: Response) => {
  try {
    const id = req.params.id;
    await UserService.deleteUser(id);
    res.json({ success: true, message: 'Xoá user thành công' });
  } catch (error: any) {
    if (error.code === 'P2025' || error.message === 'P2025') {
      res.status(404).json({ success: false, message: 'Không tìm thấy user' });
      return;
    }
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const searchUsersByRole = async (req: ReqWithId, res: Response) => {
  try {
    const { role } = req.body as { role: string };
    const { users, total_items } = await UserService.searchUsersByRole(role);
    res.json({ success: true, data: users, total_items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
export const UserController = {
  getAll,
  getOne,
  create,
  update,
  remove,
  searchUsersByRole,
};
