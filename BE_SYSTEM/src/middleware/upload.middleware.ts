import { RequestHandler } from 'express';
import multer from 'multer';

const MAX_FACE_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FACE_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const faceImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FACE_IMAGE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_FACE_IMAGE_MIME_TYPES.has(file.mimetype)) {
      cb(new Error('Ảnh đăng ký phải là JPG, PNG hoặc WEBP'));
      return;
    }

    cb(null, true);
  },
});

const faceImageSingleUpload = faceImageUpload.single('file');
const attendanceFaceImageUpload = faceImageUpload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'faceImage', maxCount: 1 },
]);

function getFirstUploadedFile(req: Parameters<RequestHandler>[0]) {
  if (req.file) {
    return req.file;
  }

  const files = req.files;
  if (!files || Array.isArray(files)) {
    return null;
  }

  return (
    files.file?.[0] ??
    files.image?.[0] ??
    files.photo?.[0] ??
    files.faceImage?.[0] ??
    null
  );
}

export const handleFaceImageUpload: RequestHandler = (req, res, next) => {
  faceImageSingleUpload(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? 'Ảnh đăng ký không được vượt quá 5MB'
          : error.message;

      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : 'File ảnh đăng ký không hợp lệ',
    });
  });
};

export const handleAttendanceFaceImageUpload: RequestHandler = (
  req,
  res,
  next,
) => {
  attendanceFaceImageUpload(req, res, (error) => {
    if (!error) {
      const uploadedFile = getFirstUploadedFile(req);
      if (uploadedFile) {
        req.file = uploadedFile;
      }

      return next();
    }

    if (error instanceof multer.MulterError) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? 'Anh diem danh khong duoc vuot qua 5MB'
          : error.code === 'LIMIT_UNEXPECTED_FILE'
            ? 'Field anh diem danh phai la file, image, photo hoac faceImage'
          : error.message;

      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : 'File anh diem danh khong hop le',
    });
  });
};
