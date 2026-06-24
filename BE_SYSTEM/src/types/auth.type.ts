import { loginSchema, refreshTokenSchema } from 'validation/auth.validation';
import { z } from 'zod';

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshTokenSchema>;
