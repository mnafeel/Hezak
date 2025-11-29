import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

export const ensureUploadsDir = () => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
};

export const uploadImageHandler = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filename = req.file.filename;
    
    // Get the base URL from the request
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    const fileUrl = `${baseUrl}/uploads/${filename}`;

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

