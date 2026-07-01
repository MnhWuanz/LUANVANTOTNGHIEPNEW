import { axiosCilent } from '@/shared/lib/axios';
import type {
  CourseClassItem,
  StudentInCourseClass,
  FaceEnrollmentResult,
} from '../types/face-enrollment-type';

export const faceEnrollmentApi = {
  getMyCourseClasses: async (): Promise<CourseClassItem[]> => {
    const res = await axiosCilent.get('/teachers/me/course-classes');
    return res.data.data;
  },

  getStudentsByCourseClass: async (
    courseClassId: number,
  ): Promise<StudentInCourseClass[]> => {
    const res = await axiosCilent.get(
      `/teachers/me/course-classes/${courseClassId}/students`,
    );
    return res.data.data;
  },

  enrollFace: async (
    studentId: number,
    imageBlob: Blob,
  ): Promise<FaceEnrollmentResult> => {
    const formData = new FormData();
    formData.append('file', imageBlob, 'face-capture.jpg');

    const res = await axiosCilent.post(
      `/students/${studentId}/face-enrollments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return res.data.data;
  },
};
