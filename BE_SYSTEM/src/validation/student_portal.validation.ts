import { z } from 'zod';

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }, 'date is not valid');

export const StudentPortalAttendanceParamsSchema = z.object({
  studentCode: z.string().trim().min(1).max(100),
});

export const StudentPortalAttendanceQuerySchema = z
  .object({
    from: dateOnly.optional(),
    to: dateOnly.optional(),
    courseCode: z.string().trim().min(1).max(100).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.from && data.to && data.from > data.to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['to'],
        message: 'to must be greater than or equal to from',
      });
    }
  });

export type StudentPortalAttendanceParams = z.infer<
  typeof StudentPortalAttendanceParamsSchema
>;

export type StudentPortalAttendanceQuery = z.infer<
  typeof StudentPortalAttendanceQuerySchema
>;
