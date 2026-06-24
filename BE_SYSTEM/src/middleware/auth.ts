import { NextFunction, Request, Response } from 'express';
import { checkValidJWT } from './jwt.midleware';

const isLogin = (req: Request, res: Response, next: NextFunction) => {
  checkValidJWT(req, res, next);
};

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  const role = user?.role?.toUpperCase();
  if (role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Không có quyền truy cập' });
  }
};

const isTeacher = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  const role = user?.role?.toUpperCase();
  if (role === 'TEACHER' || role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Không có quyền truy cập' });
  }
};

export { isLogin, isAdmin, isTeacher };
