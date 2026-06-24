// import bcrypt from 'bcrypt';
// import jwt, { Secret, SignOptions } from 'jsonwebtoken';
// import crypto from 'crypto';
// import { prisma } from 'config/client';

// const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as Secret;
// const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as Secret;

// const parseExpiresIn = (
//   val: string | undefined,
//   defaultVal: string | number,
// ): SignOptions['expiresIn'] => {
//   if (!val) return defaultVal as SignOptions['expiresIn'];
//   if (/^\d+$/.test(val)) {
//     return Math.floor(parseInt(val, 10) / 1000);
//   }
//   return val as SignOptions['expiresIn'];
// };

// const JWT_ACCESS_EXPIRES = parseExpiresIn(process.env.JWT_ACCESS_EXPIRES, '1h');
// const JWT_REFRESH_EXPIRES = parseExpiresIn(
//   process.env.JWT_REFRESH_EXPIRES,
//   '7d',
// );

// export const generateAccessToken = (
//   userId: string,
//   email: string,
//   role: string,
// ): string => {
//   return jwt.sign({ userId, email, role }, JWT_ACCESS_SECRET, {
//     expiresIn: JWT_ACCESS_EXPIRES,
//   });
// };

// // Generate and store refresh token (random cryptographically secure string)
// export const generateRefreshToken = async (
//   userId: string,
//   userEmail: string,
//   role: string,
// ): Promise<string> => {
//   const rawToken = jwt.sign({ userId, userEmail, role }, JWT_REFRESH_SECRET, {
//     expiresIn: JWT_REFRESH_EXPIRES,
//   });
//   const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
//   await prisma.user.update({
//     where: { userId },
//     data: {
//       refreshToken: tokenHash,
//     },
//   });
//   return rawToken;
// };

// export const loginService = async (email: string, password: string) => {
//   const user = await prisma.user.findUnique({
//     where: { email },
//     include: { teacher: true },
//   });

//   if (!user) {
//     return null;
//   }

//   const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
//   if (!isPasswordValid) {
//     return null;
//   }

//   const accessToken = generateAccessToken(user.userId, user.email, user.role);
//   const refreshToken = await generateRefreshToken(
//     user.userId,
//     user.email,
//     user.role,
//   );
//   return {
//     user: {
//       userId: user.userId,
//       email: user.email,
//       role: user.role,
//       fullName: user.teacher?.fullName || 'Admin',
//     },
//     accessToken,
//     refreshToken,
//   };
// };

// export const refreshAccessTokenService = async (rawRefreshToken: string) => {
//   try {
//     const decoded = jwt.verify(rawRefreshToken, JWT_REFRESH_SECRET) as {
//       userId: string;
//       userEmail: string;
//       role: string;
//     };

//     const tokenHash = crypto
//       .createHash('sha256')
//       .update(rawRefreshToken)
//       .digest('hex');
//     const user = await prisma.user.findFirst({
//       where: {
//         userId: decoded.userId,
//         refreshToken: tokenHash,
//       },
//       include: {
//         teacher: true,
//       },
//     });

//     if (!user) {
//       return null;
//     }

//     const newAccessToken = generateAccessToken(
//       user.userId,
//       user.email,
//       user.role,
//     );
//     const newRefreshToken = await generateRefreshToken(
//       user.userId,
//       user.email,
//       user.role,
//     );

//     return {
//       user: {
//         userId: user.userId,
//         email: user.email,
//         role: user.role,
//         fullName: user.teacher?.fullName || 'Admin',
//       },
//       accessToken: newAccessToken,
//       refreshToken: newRefreshToken,
//     };
//   } catch (error) {
//     console.error('Refresh token error:', error);
//     return null;
//   }
// };

// export const logoutService = async (rawRefreshToken: string) => {
//   const tokenHash = crypto
//     .createHash('sha256')
//     .update(rawRefreshToken)
//     .digest('hex');

//   await prisma.user.updateMany({
//     where: {
//       refreshToken: tokenHash,
//     },
//     data: {
//       refreshToken: null,
//     },
//   });
// };
