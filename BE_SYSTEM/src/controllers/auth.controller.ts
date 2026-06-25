import crypto from 'crypto';
import { CookieOptions, Request, Response } from 'express';
import { authService } from 'services/auth.service';
import { UserService } from 'services/user.service';
import { comparePassword } from 'src/utils/password.util';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from 'src/utils/jwt.util';
import { loginSchema } from 'validation/auth.validation';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

type AuthUser = {
  id_user: number;
  email: string;
  role: string;
  teachers?: {
    id_teacher: number;
    full_name: string;
    teacher_code: string;
  } | null;
};

const getRefreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  path: '/api',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
});

const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...getRefreshCookieOptions(),
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
};

const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
};

const hashRefreshToken = (refreshToken: string): string => {
  return crypto.createHash('sha256').update(refreshToken).digest('hex');
};

const compareRefreshToken = (
  refreshToken: string,
  hashedRefreshToken: string,
): boolean => {
  return hashRefreshToken(refreshToken) === hashedRefreshToken;
};

const toAuthUserResponse = (user: AuthUser) => ({
  id_user: user.id_user,
  email: user.email,
  role: user.role,
  teacher: user.teachers
    ? {
        id_teacher: user.teachers.id_teacher,
        full_name: user.teachers.full_name,
        teacher_code: user.teachers.teacher_code,
      }
    : null,
});

export const authLogin = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Du lieu dang nhap khong hop le',
      errors: result.error.flatten(),
    });
  }

  const { email, password } = result.data;
  const user = await UserService.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Email hoac mat khau khong dung',
    });
  }

  if (!user.is_active) {
    return res.status(403).json({
      success: false,
      message: 'Tai khoan da bi khoa',
    });
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Email hoac mat khau khong dung',
    });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const userUpdated = await authService.updateUserLogin(
    user.id_user,
    hashRefreshToken(refreshToken),
  );

  setRefreshTokenCookie(res, refreshToken);

  return res.status(200).json({
    success: true,
    message: 'Dang nhap thanh cong',
    data: {
      accessToken,
      user: toAuthUserResponse(userUpdated),
    },
  });
};

export const authRefreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token khong ton tai',
    });
  }

  let payload: { id_user: number };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    clearRefreshTokenCookie(res);
    return res.status(401).json({
      success: false,
      message: 'Refresh token khong hop le',
    });
  }

  const user = await UserService.findUserByID(payload.id_user);
  if (!user) {
    clearRefreshTokenCookie(res);
    return res.status(401).json({
      success: false,
      message: 'Nguoi dung khong ton tai',
    });
  }

  if (!user.is_active) {
    return res.status(403).json({
      success: false,
      message: 'Tai khoan da bi khoa',
    });
  }

  if (
    !user.refresh_token_hash ||
    !compareRefreshToken(refreshToken, user.refresh_token_hash)
  ) {
    clearRefreshTokenCookie(res);
    return res.status(401).json({
      success: false,
      message: 'Refresh token khong khop voi du lieu he thong',
    });
  }

  const accessToken = signAccessToken(user);

  return res.status(200).json({
    success: true,
    message: 'Refresh token thanh cong',
    data: {
      accessToken,
    },
  });
};

export const authLogout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!refreshToken) {
    clearRefreshTokenCookie(res);
    return res.status(401).json({
      success: false,
      message: 'Refresh token khong ton tai',
    });
  }

  let payload: { id_user: number };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    clearRefreshTokenCookie(res);
    return res.status(401).json({
      success: false,
      message: 'Refresh token khong hop le',
    });
  }

  const user = await UserService.findUserByID(payload.id_user);
  if (!user) {
    clearRefreshTokenCookie(res);
    return res.status(401).json({
      success: false,
      message: 'Refresh token khong hop le',
    });
  }

  if (
    !user.refresh_token_hash ||
    !compareRefreshToken(refreshToken, user.refresh_token_hash)
  ) {
    clearRefreshTokenCookie(res);
    return res.status(401).json({
      success: false,
      message: 'Refresh token khong hop le',
    });
  }

  await authService.updateUserLogout(user.id_user);
  clearRefreshTokenCookie(res);

  return res.status(200).json({
    success: true,
    message: 'Dang xuat thanh cong',
  });
};

export const authMe = async (req: Request, res: Response) => {
  try {
    const id_user = req.user?.id_user;
    if (!id_user) {
      return res.status(401).json({
        success: false,
        message: 'Chua dang nhap hoac token khong hop le',
      });
    }

    const user = await UserService.findUserByID(id_user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Nguoi dung khong ton tai',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Tai khoan da bi khoa',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lay thong tin nguoi dung thanh cong',
      data: toAuthUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Da xay ra loi khi lay thong tin nguoi dung',
    });
  }
};
