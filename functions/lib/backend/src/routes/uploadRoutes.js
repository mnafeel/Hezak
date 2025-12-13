"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const uploadController_1 = require("../controllers/uploadController");
(0, uploadController_1.ensureUploadsDir)();
// Use memory storage for Firebase Storage, disk storage for local
const storage = process.env.USE_FIREBASE_STORAGE === 'true'
    ? multer_1.default.memoryStorage() // Store in memory for Firebase Storage
    : multer_1.default.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, path_1.default.resolve(process.cwd(), 'uploads'));
        },
        filename: (_req, file, cb) => {
            const uniqueSuffix = crypto_1.default.randomBytes(8).toString('hex');
            const ext = path_1.default.extname(file.originalname);
            cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
        }
    });
const imageFileFilter = (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image uploads are allowed'));
    }
    cb(null, true);
};
const videoFileFilter = (_req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
        return cb(new Error('Only video uploads are allowed'));
    }
    cb(null, true);
};
const imageUpload = (0, multer_1.default)({
    storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15MB for images
    }
});
const videoUpload = (0, multer_1.default)({
    storage,
    fileFilter: videoFileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB for videos
    }
});
const router = (0, express_1.Router)();
const singleImageUpload = imageUpload.single('file');
const singleVideoUpload = videoUpload.single('file');
router.post('/image', (req, res) => {
    try {
        (0, uploadController_1.ensureUploadsDir)(); // Ensure directory exists before upload
        singleImageUpload(req, res, (err) => {
            if (err) {
                console.error('Upload error:', err);
                if (err instanceof multer_1.default.MulterError) {
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
            return (0, uploadController_1.uploadImageHandler)(req, res);
        });
    }
    catch (error) {
        console.error('Error in upload route:', error);
        res.status(500).json({
            message: 'Upload failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/video', (req, res) => {
    try {
        (0, uploadController_1.ensureUploadsDir)(); // Ensure directory exists before upload
        singleVideoUpload(req, res, (err) => {
            if (err) {
                console.error('Upload error:', err);
                if (err instanceof multer_1.default.MulterError) {
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
            // Use video handler
            return (0, uploadController_1.uploadVideoHandler)(req, res);
        });
    }
    catch (error) {
        console.error('Error in video upload route:', error);
        res.status(500).json({
            message: 'Upload failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.uploadRouter = router;
//# sourceMappingURL=uploadRoutes.js.map