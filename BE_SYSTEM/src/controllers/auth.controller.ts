// import { Request, Response } from 'express';
// import { prisma } from 'config/client';
// import {
//   loginService,
//   refreshAccessTokenService,
//   logoutService,
// } from 'services/auth.service';
// import { loginSchema, refreshTokenSchema } from 'validation/auth.validation';

// const login = async (req: Request, res: Response) => {
//   try {
//     const validationResult = loginSchema.safeParse(req.body);
//     if (!validationResult.success) {
//       return res.status(400).json({
//         success: false,
//         message: 'Dữ liệu gửi lên không hợp lệ',
//         errors: validationResult.error.flatten().fieldErrors,
//       });
//     }
//     const { email, password } = validationResult.data;
//     const result = await loginService(email, password);
//     if (!result) {
//       return res.status(401).json({
//         success: false,
//         message: 'Email hoặc mật khẩu không chính xác',
//       });
//     }
//     // Set Refresh Token in httpOnly cookie
//     res.cookie('refreshToken', result.refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES || '604800000'),
//       path: '/',
//     });
//     // Return User Info and Access Token
//     res.json({
//       success: true,
//       data: {
//         user: result.user,
//         accessToken: result.accessToken,
//       },
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi server khi đăng nhập',
//     });
//   }
// };

// const refresh = async (req: Request, res: Response) => {
//   try {
//     const refreshToken = req.cookies?.refreshToken;

//     if (!refreshToken) {
//       return res.status(401).json({
//         success: false,
//         message: 'Không tìm thấy refresh token',
//       });
//     }

//     const result = await refreshAccessTokenService(refreshToken);

//     if (!result) {
//       res.clearCookie('refreshToken', {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         path: '/',
//       });

//       return res.status(401).json({
//         success: false,
//         message: 'Refresh token không hợp lệ hoặc đã hết hạn',
//       });
//     }

//     res.cookie('refreshToken', result.refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES || '604800000'),
//       path: '/',
//     });

//     return res.json({
//       success: true,
//       data: {
//         user: result.user,
//         accessToken: result.accessToken,
//       },
//     });
//   } catch (error) {
//     console.error('Refresh token error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Lỗi server khi làm mới token',
//     });
//   }
// };

// const logout = async (req: Request, res: Response) => {
//   try {
//     const refreshToken = req.cookies?.refreshToken;
//     if (refreshToken) {
//       await logoutService(refreshToken);
//     }

//     // Clear the refresh token cookie
//     res.clearCookie('refreshToken', {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       path: '/',
//     });

//     res.json({
//       success: true,
//       message: 'Đăng xuất thành công',
//     });
//   } catch (error) {
//     console.error('Logout error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi server khi đăng xuất',
//     });
//   }
// };

// const getMe = async (req: Request, res: Response) => {
//   try {
//     const userPayload = (req as any).user;
//     if (!userPayload || !userPayload.userId) {
//       return res.status(401).json({
//         success: false,
//         message: 'Không có phiên đăng nhập',
//       });
//     }
//     const user = await prisma.user.findUnique({
//       where: { userId: userPayload.userId },
//       include: { teacher: true },
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'Không tìm thấy thông tin người dùng',
//       });
//     }
//     res.json({
//       success: true,
//       data: {
//         userId: user.userId,
//         email: user.email,
//         role: user.role,
//         fullName: user.teacher?.fullName || 'Admin',
//       },
//     });
//   } catch (error) {
//     console.error('GetMe error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi server khi lấy thông tin người dùng',
//     });
//   }
// };

// export const LoginController = {
//   login,
//   refresh,
//   logout,
//   getMe,
// };
