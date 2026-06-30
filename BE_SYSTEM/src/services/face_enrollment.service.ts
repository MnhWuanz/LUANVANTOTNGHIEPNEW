import { FaceEnrollmentStatus } from '@prisma/client';
import { prisma } from 'config/client';
import {
  AwsRekognitionService,
  RekognitionImageError,
} from 'services/aws_rekognition.service';
import { AwsS3Service } from 'services/aws_s3.service';

export class FaceEnrollmentError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

const assertTeacherCanEnrollStudent = async (
  teacherUserId: number,
  studentId: number,
) => {
  const teacher = await prisma.teacher.findUnique({
    where: {
      id_user: teacherUserId,
    },
    select: {
      id_teacher: true,
    },
  });

  if (!teacher) {
    throw new FaceEnrollmentError(403, 'Chỉ giáo viên mới được đăng ký khuôn mặt');
  }

  const student = await prisma.student.findUnique({
    where: {
      id_student: studentId,
    },
    select: {
      id_student: true,
      student_code: true,
      full_name: true,
    },
  });

  if (!student) {
    throw new FaceEnrollmentError(404, 'Sinh viên không tồn tại');
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      id_student: studentId,
      course_class: {
        id_teacher: teacher.id_teacher,
      },
    },
    select: {
      id_enrollment: true,
    },
  });

  if (!enrollment) {
    throw new FaceEnrollmentError(
      403,
      'Giáo viên không có quyền đăng ký khuôn mặt cho sinh viên này',
    );
  }

  return {
    teacher,
    student,
  };
};

const enrollStudentFace = async (params: {
  teacherUserId: number;
  studentId: number;
  imageBuffer: Buffer;
  mimeType: string;
}) => {
  const { student } = await assertTeacherCanEnrollStudent(
    params.teacherUserId,
    params.studentId,
  );

  let indexedFace:
    | {
        collectionId: string;
        faceId: string;
        confidence: number | null;
      }
    | null = null;
  let uploadedImageKey: string | null = null;

  try {
    await AwsRekognitionService.ensureCollection();

    indexedFace = await AwsRekognitionService.indexStudentFace({
      studentId: params.studentId,
      imageBuffer: params.imageBuffer,
    });

    const uploadedImage = await AwsS3Service.uploadFaceEnrollmentImage({
      studentId: params.studentId,
      imageBuffer: params.imageBuffer,
      mimeType: params.mimeType,
    });
    uploadedImageKey = uploadedImage.s3Key;

    const result = await prisma.$transaction(async (tx) => {
      const createdEnrollment = await tx.face_Enrollment.create({
        data: {
          face_id: indexedFace!.faceId,
          collection_id: indexedFace!.collectionId,
          image_s3_key: uploadedImageKey!,
          status: FaceEnrollmentStatus.ACTIVE,
          quality_score: indexedFace!.confidence,
          id_student: params.studentId,
          id_user: params.teacherUserId,
        },
        select: {
          id_face_enrollment: true,
          face_id: true,
          collection_id: true,
          image_s3_key: true,
          status: true,
          quality_score: true,
          enrolled_at: true,
        },
      });

      const replacedEnrollments = await tx.face_Enrollment.findMany({
        where: {
          id_student: params.studentId,
          status: FaceEnrollmentStatus.ACTIVE,
          id_face_enrollment: {
            not: createdEnrollment.id_face_enrollment,
          },
        },
        select: {
          face_id: true,
          collection_id: true,
        },
      });

      await tx.face_Enrollment.updateMany({
        where: {
          id_student: params.studentId,
          status: FaceEnrollmentStatus.ACTIVE,
          id_face_enrollment: {
            not: createdEnrollment.id_face_enrollment,
          },
        },
        data: {
          status: FaceEnrollmentStatus.REPLACED,
        },
      });

      await tx.student.update({
        where: {
          id_student: params.studentId,
        },
        data: {
          is_face_registered: true,
        },
      });

      return {
        createdEnrollment,
        replacedEnrollments,
      };
    });

    const replacedFaceIds = result.replacedEnrollments
      .filter((item) => item.collection_id === indexedFace!.collectionId)
      .map((item) => item.face_id);

    await AwsRekognitionService.deleteFaces(replacedFaceIds).catch((error) => {
      console.error('Delete replaced Rekognition faces failed:', error);
    });

    return {
      idFaceEnrollment: result.createdEnrollment.id_face_enrollment,
      student: {
        idStudent: student.id_student,
        studentCode: student.student_code,
        fullName: student.full_name,
      },
      faceId: result.createdEnrollment.face_id,
      collectionId: result.createdEnrollment.collection_id,
      imageS3Key: result.createdEnrollment.image_s3_key,
      status: result.createdEnrollment.status,
      qualityScore: result.createdEnrollment.quality_score,
      enrolledAt: result.createdEnrollment.enrolled_at,
    };
  } catch (error) {
    if (error instanceof RekognitionImageError) {
      throw new FaceEnrollmentError(400, error.message);
    }

    if (indexedFace) {
      await AwsRekognitionService.deleteFaces([
        indexedFace.faceId,
      ]).catch((cleanupError) => {
        console.error('Cleanup indexed Rekognition face failed:', cleanupError);
      });
    }

    if (uploadedImageKey) {
      await AwsS3Service.deleteObject(uploadedImageKey).catch((cleanupError) => {
        console.error('Cleanup S3 face enrollment image failed:', cleanupError);
      });
    }

    throw error;
  }
};

export const FaceEnrollmentService = {
  enrollStudentFace,
};
