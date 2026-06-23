import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import 'dotenv/config';
import { tokenBlacklist } from 'config/tokenBlacklist';

const checkValidJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không có token' });
  }
  const token = authHeader.split(' ')[1];

  // Kiểm tra token đã bị thu hồi chưa
  if (tokenBlacklist.isBlacklisted(token)) {
    return res
      .status(401)
      .json({ message: 'Token đã bị thu hồi, vui lòng đăng nhập lại' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as any;
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

export { checkValidJWT };
