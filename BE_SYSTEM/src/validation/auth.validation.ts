import { z } from 'zod';
export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({
      required_error: 'Refresh token là bắt buộc',
      invalid_type_error: 'Refresh token phải là một chuỗi',
    })
    .trim()
    .regex(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/, {
      message: 'Refresh token không hợp lệ',
    }),
});
export type LoginInputSchema = z.infer<typeof loginSchema>;
export type RefreshInputSchema = z.infer<typeof refreshTokenSchema>;
