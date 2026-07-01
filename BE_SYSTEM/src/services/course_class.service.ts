import { prisma } from 'config/client';

const getCourseClassesByTeacherUserId = async (teacherUserId: number) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id_user: teacherUserId },
    select: { id_teacher: true },
  });

  if (!teacher) {
    return [];
  }

  const courseClasses = await prisma.course_Class.findMany({
    where: { id_teacher: teacher.id_teacher },
    select: {
      id_course_class: true,
      course_code: true,
      subject: {
        select: {
          name: true,
          subject_code: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
    orderBy: { course_code: 'asc' },
  });

  return courseClasses.map((cc) => ({
    id_course_class: cc.id_course_class,
    course_code: cc.course_code,
    subject_name: cc.subject.name,
    subject_code: cc.subject.subject_code,
    total_students: cc._count.enrollments,
  }));
};

const getStudentsByCourseClassId = async (
  courseClassId: number,
  teacherUserId: number,
) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id_user: teacherUserId },
    select: { id_teacher: true },
  });

  if (!teacher) {
    return null;
  }

  const courseClass = await prisma.course_Class.findFirst({
    where: {
      id_course_class: courseClassId,
      id_teacher: teacher.id_teacher,
    },
    select: { id_course_class: true },
  });

  if (!courseClass) {
    return null;
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { id_course_class: courseClassId },
    select: {
      student: {
        select: {
          id_student: true,
          student_code: true,
          full_name: true,
          email: true,
          class: true,
          is_face_registered: true,
          faceEnrollments: {
            where: { status: 'ACTIVE' },
            select: {
              id_face_enrollment: true,
              enrolled_at: true,
              quality_score: true,
            },
            take: 1,
            orderBy: { enrolled_at: 'desc' },
          },
        },
      },
    },
    orderBy: { student: { student_code: 'asc' } },
  });

  return enrollments.map((e) => {
    const activeFace = e.student.faceEnrollments[0] || null;

    return {
      id_student: e.student.id_student,
      student_code: e.student.student_code,
      full_name: e.student.full_name,
      email: e.student.email,
      class: e.student.class,
      is_face_registered: e.student.is_face_registered,
      active_face_enrollment: activeFace
        ? {
            id_face_enrollment: activeFace.id_face_enrollment,
            enrolled_at: activeFace.enrolled_at,
            quality_score: activeFace.quality_score,
          }
        : null,
    };
  });
};

export const CourseClassService = {
  getCourseClassesByTeacherUserId,
  getStudentsByCourseClassId,
};
