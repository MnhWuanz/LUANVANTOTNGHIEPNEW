import { z } from 'zod';

export const syncSinglePayloadSchema = z.object({
  classSectionId: z.string().min(1, 'classSectionId không được để trống'),
  subjectName: z.string().min(1, 'subjectName không được để trống'),
  room: z.object({
    roomId: z.string().min(1, 'roomId không được để trống'),
    roomName: z.string().min(1, 'roomName không được để trống'),
  }),
  teacher: z.object({
    teacherId: z.string().min(1, 'teacherId không được để trống'),
    fullName: z.string().min(1, 'fullName không được để trống'),
    email: z.string().email('Email giảng viên không hợp lệ'),
  }),
  schedules: z.array(
    z.object({
      dayOfWeek: z.number().int(),
      startTime: z.string().min(1),
      endTime: z.string().min(1),
      startDate: z.string().min(1),
      endDate: z.string().min(1),
    })
  ),
  students: z.array(
    z.object({
      studentId: z.string().min(1),
      fullName: z.string().min(1),
      email: z.string().email('Email sinh viên không hợp lệ'),
      class: z.string().min(1),
    })
  ),
});

export const syncPayloadSchema = z.union([
  syncSinglePayloadSchema,
  z.array(syncSinglePayloadSchema),
]);

export type SyncPayloadInput = z.infer<typeof syncPayloadSchema>;
export type SyncSinglePayloadInput = z.infer<typeof syncSinglePayloadSchema>;

