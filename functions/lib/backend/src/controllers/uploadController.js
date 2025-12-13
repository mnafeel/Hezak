"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageHandler = exports.uploadVideoHandler = exports.ensureUploadsDir = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const firebaseAdmin_1 = require("../utils/firebaseAdmin");
const UPLOADS_DIR = path_1.default.resolve(process.cwd(), 'uploads');
const ensureUploadsDir = () => {
    if (!fs_1.default.existsSync(UPLOADS_DIR)) {
        fs_1.default.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
};
exports.ensureUploadsDir = ensureUploadsDir;
// Upload to Firebase Storage
const uploadToFirebaseStorage = async (file) => {
    if (!file.buffer) {
        throw new Error('File buffer is required for Firebase Storage upload');
    }
    if (!firebaseAdmin_1.storage) {
        throw new Error('Firebase Storage not initialized');
    }
    // In Firebase Functions, storage is already a bucket
    const bucket = firebaseAdmin_1.storage;
    const fileExtension = path_1.default.extname(file.originalname);
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
const uploadVideoHandler = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Try Firebase Storage first, fallback to local storage
        let fileUrl;
        let filename;
        // In Firebase Functions, always use Firebase Storage
        if (firebaseAdmin_1.storage) {
            // Upload to Firebase Storage
            fileUrl = await uploadToFirebaseStorage(req.file);
            filename = path_1.default.basename(fileUrl);
            console.log('✅ Video uploaded to Firebase Storage:', fileUrl);
        }
        else {
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
    }
    catch (error) {
        console.error('Error in uploadVideoHandler:', error);
        res.status(500).json({
            message: 'Failed to upload video',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.uploadVideoHandler = uploadVideoHandler;
const uploadImageHandler = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Try Firebase Storage first, fallback to local storage
        let fileUrl;
        let filename;
        // In Firebase Functions, always use Firebase Storage
        if (firebaseAdmin_1.storage) {
            // Upload to Firebase Storage
            fileUrl = await uploadToFirebaseStorage(req.file);
            filename = path_1.default.basename(fileUrl);
            console.log('✅ Image uploaded to Firebase Storage:', fileUrl);
        }
        else {
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
    }
    catch (error) {
        console.error('Error in uploadImageHandler:', error);
        res.status(500).json({
            message: 'Failed to upload image',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.uploadImageHandler = uploadImageHandler;
//# sourceMappingURL=uploadController.js.map