import {
  RekognitionClient,
  CreateCollectionCommand,
  DeleteFacesCommand,
  DetectFacesCommand,
  IndexFacesCommand,
  SearchFacesByImageCommand,
} from '@aws-sdk/client-rekognition';

const DEFAULT_FACE_MATCH_THRESHOLD = 90;

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION,
});

export class RekognitionImageError extends Error {}

function getCollectionId() {
  const collectionId = process.env.AWS_REKOGNITION_COLLECTION_ID;

  if (!collectionId) {
    throw new Error('AWS_REKOGNITION_COLLECTION_ID is not configured');
  }

  return collectionId;
}

const ensureCollection = async () => {
  const collectionId = getCollectionId();

  try {
    await rekognition.send(
      new CreateCollectionCommand({
        CollectionId: collectionId,
      }),
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === 'ResourceAlreadyExistsException'
    ) {
      return {
        collectionId,
        created: false,
      };
    }

    throw error;
  }
  return {
    collectionId,
    created: true,
  };
};

const assertSingleFace = async (imageBuffer: Buffer) => {
  const result = await rekognition.send(
    new DetectFacesCommand({
      Image: {
        Bytes: imageBuffer,
      },
      Attributes: ['DEFAULT'],
    }),
  );

  const faceCount = result.FaceDetails?.length ?? 0;

  if (faceCount !== 1) {
    throw new RekognitionImageError('Ảnh đăng ký phải có đúng 1 khuôn mặt');
  }
};

const indexStudentFace = async (params: {
  studentId: number;
  imageBuffer: Buffer;
}) => {
  const collectionId = getCollectionId();
  await assertSingleFace(params.imageBuffer);

  const result = await rekognition.send(
    new IndexFacesCommand({
      CollectionId: collectionId,
      Image: {
        Bytes: params.imageBuffer,
      },
      ExternalImageId: String(params.studentId),
      MaxFaces: 1,
      QualityFilter: 'AUTO',
    }),
  );

  const face = result.FaceRecords?.[0]?.Face;

  if (!face?.FaceId) {
    throw new RekognitionImageError(
      'Không index được khuôn mặt từ ảnh đăng ký',
    );
  }

  return {
    collectionId,
    faceId: face.FaceId,
    confidence: face.Confidence ?? null,
  };
};

const deleteFaces = async (faceIds: string[], collectionId = getCollectionId()) => {
  if (faceIds.length === 0) {
    return;
  }
  await rekognition.send(
    new DeleteFacesCommand({
      CollectionId: collectionId,
      FaceIds: faceIds,
    }),
  );
};

const searchStudentFace = async (imageBuffer: Buffer) => {
  const collectionId = getCollectionId();
  const threshold = Number(
    process.env.FACE_MATCH_THRESHOLD ?? DEFAULT_FACE_MATCH_THRESHOLD,
  );

  const result = await rekognition.send(
    new SearchFacesByImageCommand({
      CollectionId: collectionId,
      Image: {
        Bytes: imageBuffer,
      },
      MaxFaces: 1,
      FaceMatchThreshold: threshold,
      QualityFilter: 'AUTO',
    }),
  );

  const match = result.FaceMatches?.[0];

  if (!match?.Face?.FaceId) {
    return null;
  }

  return {
    collectionId,
    faceId: match.Face.FaceId,
    externalImageId: match.Face.ExternalImageId ?? null,
    similarity: match.Similarity ?? null,
  };
};

export const AwsRekognitionService = {
  ensureCollection,
  indexStudentFace,
  deleteFaces,
  searchStudentFace,
};
