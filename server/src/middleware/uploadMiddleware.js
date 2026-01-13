import multer from 'multer';
import path from 'path';
import { sendErrorResponse } from '../utils/responseHandler.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

export const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);

    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return sendErrorResponse(res, 'File size exceeds 5MB limit', 400);
        }
        return sendErrorResponse(res, err.message, 400);
      } else if (err) {
        return sendErrorResponse(res, err.message, 400);
      }
      next();
    });
  };
};

export const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);

    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return sendErrorResponse(res, 'One or more files exceed 5MB limit', 400);
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return sendErrorResponse(res, `Maximum ${maxCount} files allowed`, 400);
        }
        return sendErrorResponse(res, err.message, 400);
      } else if (err) {
        return sendErrorResponse(res, err.message, 400);
      }
      next();
    });
  };
};

export const uploadFields = (fields) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.fields(fields);

    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return sendErrorResponse(res, 'File size exceeds 5MB limit', 400);
        }
        return sendErrorResponse(res, err.message, 400);
      } else if (err) {
        return sendErrorResponse(res, err.message, 400);
      }
      next();
    });
  };
};

export default upload;
