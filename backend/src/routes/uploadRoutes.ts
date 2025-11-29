import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { ensureUploadsDir, uploadImageHandler } from '../controllers/uploadController';

ensureUploadsDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(process.cwd(), 'uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

const imageFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image uploads are allowed'));
  }
  cb(null, true);
};

const videoFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!file.mimetype.startsWith('video/')) {
    return cb(new Error('Only video uploads are allowed'));
  }
  cb(null, true);
};

const imageUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB for images
  }
});

const videoUpload = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB for videos
  }
});

const router = Router();

const singleImageUpload = imageUpload.single('file');
const singleVideoUpload = videoUpload.single('file');

router.post('/image', (req, res) => {
  try {
    ensureUploadsDir(); // Ensure directory exists before upload
    singleImageUpload(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res
              .status(400)
              .json({ message: 'Image is too large. Please upload a file under 15MB.' });
          }
          return res.status(400).json({ 
            message: 'Upload failed', 
            error: err.message,
            code: err.code
          });
        }
        return res.status(500).json({ 
          message: 'Upload failed', 
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }

      return uploadImageHandler(req, res);
    });
  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(500).json({ 
      message: 'Upload failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/video', (req, res) => {
  try {
    ensureUploadsDir(); // Ensure directory exists before upload
    singleVideoUpload(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res
              .status(400)
              .json({ message: 'Video is too large. Please upload a file under 500MB.' });
          }
          return res.status(400).json({ 
            message: 'Upload failed', 
            error: err.message,
            code: err.code
          });
        }
        return res.status(500).json({ 
          message: 'Upload failed', 
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }

      // Use the same handler for videos (it just returns the file URL)
      return uploadImageHandler(req, res);
    });
  } catch (error) {
    console.error('Error in video upload route:', error);
    res.status(500).json({ 
      message: 'Upload failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const uploadRouter = router;

