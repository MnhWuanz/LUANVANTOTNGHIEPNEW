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
