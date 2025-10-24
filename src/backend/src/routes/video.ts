import { Router } from 'express';
import { redownloadVideo } from '../controllers/videoController';

const router = Router();

// 重新下载视频
router.post('/redownload/:videoId', redownloadVideo);

export default router;
