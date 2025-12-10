import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import { storage } from '../utils/firebaseAdmin';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

export const ensureUploadsDir = () => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
};

// Upload to Firebase Storage
const uploadToFirebaseStorage = async (file: Express.Multer.File): Promise<string> => {
  if (!storage) {
    throw new Error('Firebase Storage not initialized');
  }

  const bucket = storage.bucket();
  const fileExtension = path.extname(file.originalname);
  const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;
  const fileUpload = bucket.file(fileName);

  // Upload file buffer to Firebase Storage
  await fileUpload.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
    },
    public: true, // Make file publicly accessible
  });

  // Make the file publicly accessible
  await fileUpload.makePublic();

  // Get public URL
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  return publicUrl;
};

export const uploadVideoHandler = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Try Firebase Storage first, fallback to local storage
    let fileUrl: string;
    let filename: string;

    if (storage && process.env.USE_FIREBASE_STORAGE === 'true') {
      // Upload to Firebase Storage
      fileUrl = await uploadToFirebaseStorage(req.file);
      filename = path.basename(fileUrl);
      console.log('✅ Video uploaded to Firebase Storage:', fileUrl);
    } else {
      // Fallback to local storage
      filename = req.file.filename;
      const protocol = req.protocol;
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}`;
      fileUrl = `${baseUrl}/uploads/${filename}`;
      console.log('⚠️ Video stored locally (will be lost on server restart):', fileUrl);
    }

    return res.status(201).json({
      url: fileUrl,
      filename
    });
  } catch (error) {
    console.error('Error in uploadVideoHandler:', error);
    res.status(500).json({ 
      message: 'Failed to upload video',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const uploadImageHandler = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Try Firebase Storage first, fallback to local storage
    let fileUrl: string;
    let filename: string;

    if (storage && process.env.USE_FIREBASE_STORAGE === 'true') {
      // Upload to Firebase Storage
      fileUrl = await uploadToFirebaseStorage(req.file);
      filename = path.basename(fileUrl);
      console.log('✅ Image uploaded to Firebase Storage:', fileUrl);
    } else {
      // Fallback to local storage
      filename = req.file.filename;
      const protocol = req.protocol;
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}`;
      fileUrl = `${baseUrl}/uploads/${filename}`;
      console.log('⚠️ Image stored locally (will be lost on server restart):', fileUrl);
    }

    return res.status(201).json({
      url: fileUrl,
      filename
    });
  } catch (error) {
    console.error('Error in uploadImageHandler:', error);
    res.status(500).json({ 
      message: 'Failed to upload image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
