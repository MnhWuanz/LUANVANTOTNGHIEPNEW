import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Password phải có ít nhất 6 ký tự'),
  role: z.enum(['admin', 'teacher'], {
    errorMap: () => ({ message: 'Role phải là admin hoặc teacher' }),
  }),
  name: z.string().min(1, 'Tên không được để trống').max(255),
});

export const updateUserSchema = z.object({
  email: z.string().email('Email không hợp lệ').optional(),
  name: z.string().min(1).max(255).optional(),
  code: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
  face_url: z.string().max(500).optional(),
  class: z.string().max(100).optional(),
  role: z
    .enum(['admin', 'teacher'], {
      errorMap: () => ({ message: 'Role phải là admin hoặc teacher' }),
    })
    .optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
