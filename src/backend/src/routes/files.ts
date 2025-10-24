import { Router } from 'express';
import { upload } from '../middleware/fileUpload';
import { uploadFile, getFile } from '../controllers/fileController';

const router = Router();

// Upload image file
router.post('/upload', upload.single('image'), uploadFile);

// Get video file
router.get('/video/:filename', getFile);

export default router;
