export interface CourseClassItem {
  id_course_class: number;
  course_code: string;
  subject_name: string;
  subject_code: string;
  total_students: number;
}

export interface StudentInCourseClass {
  id_student: number;
  student_code: string;
  full_name: string;
  email: string;
  class: string;
  is_face_registered: boolean;
  active_face_enrollment: {
    id_face_enrollment: number;
    enrolled_at: string;
    quality_score: number | null;
  } | null;
}

export interface FaceEnrollmentResult {
  idFaceEnrollment: number;
  student: {
    idStudent: number;
    studentCode: string;
    fullName: string;
  };
  faceId: string;
  collectionId: string;
  imageS3Key: string;
  status: string;
  qualityScore: number | null;
  enrolledAt: string;
}
