import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

function getBucketName() {
  const bucket = process.env.AWS_S3_BUCKET;

  if (!bucket) {
    throw new Error('AWS_S3_BUCKET is not configured');
  }

  return bucket;
}

function getImageExtension(mimeType: string) {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
}

const uploadFaceEnrollmentImage = async (params: {
  studentId: number;
  imageBuffer: Buffer;
  mimeType: string;
}) => {
  const extension = getImageExtension(params.mimeType);
  const key = `face-enrollments/student-${params.studentId}/${randomUUID()}.${extension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: params.imageBuffer,
      ContentType: params.mimeType,
    }),
  );

  return {
    s3Key: key,
  };
};

const deleteObject = async (key: string) => {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    }),
  );
};

export const AwsS3Service = {
  uploadFaceEnrollmentImage,
  deleteObject,
};
