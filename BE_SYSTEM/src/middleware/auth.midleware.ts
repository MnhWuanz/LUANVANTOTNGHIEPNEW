import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from 'src/utils/jwt.util';
export type AuthPayload = {
  id_user: number;
  email: string;
  role: string;
};
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Thiếu access token trong header Authorization',
    });
  }
  const accessToken = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(accessToken);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Access token không hợp lệ hoặc đã hết hạn',
    });
  }
};
