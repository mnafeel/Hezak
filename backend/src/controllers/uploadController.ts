import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { storage } from '../utils/firebaseAdmin';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// Type for multer file (works with both memory and disk storage)
interface MulterFile {
  buffer?: Buffer;
  filename?: string;
  originalname: string;
  mimetype: string;
  size: number;
}

export const ensureUploadsDir = () => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
};

// Configure Cloudinary from CLOUDINARY_URL (single env var)
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
  console.log('✅ Cloudinary configured from CLOUDINARY_URL');
}

// Upload to Cloudinary
const uploadToCloudinary = async (file: MulterFile): Promise<string> => {
  if (!file.buffer) {
    throw new Error('File buffer is required for Cloudinary upload');
  }

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'uploads',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) return reject(new Error('No URL returned from Cloudinary'));
        resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });
};

// Upload to Firebase Storage (fallback)
const uploadToFirebaseStorage = async (file: MulterFile): Promise<string> => {
  if (!file.buffer) {
    throw new Error('File buffer is required for Firebase Storage upload');
  }
  if (!storage) {
    throw new Error('Firebase Storage not initialized');
  }

  const bucket = storage.bucket();
  const fileExtension = path.extname(file.originalname);
  const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;
  const fileUpload = bucket.file(fileName);

  await fileUpload.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
    },
    public: true,
  });

  await fileUpload.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
};

export const uploadVideoHandler = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Try Cloudinary first, then Firebase Storage, then local storage
    let fileUrl: string;
    let filename: string;

    if (process.env.CLOUDINARY_URL) {
      fileUrl = await uploadToCloudinary(req.file);
      filename = path.basename(fileUrl);
      console.log('✅ Video uploaded to Cloudinary:', fileUrl);
    } else if (storage && process.env.USE_FIREBASE_STORAGE === 'true') {
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

    // Try Cloudinary first, then Firebase Storage, then local storage
    let fileUrl: string;
    let filename: string;

    if (process.env.CLOUDINARY_URL) {
      fileUrl = await uploadToCloudinary(req.file);
      filename = path.basename(fileUrl);
      console.log('✅ Image uploaded to Cloudinary:', fileUrl);
    } else if (storage && process.env.USE_FIREBASE_STORAGE === 'true') {
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
