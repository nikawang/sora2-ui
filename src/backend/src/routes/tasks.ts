import { Router } from 'express';
import {
  submitTask,
  submitTextToVideoTask,
  submitImageToVideoTask,
  getTaskStatus,
  getTasks,
  cancelTask,
  deleteTask,
  getStats,
} from '../controllers/taskController';
import { upload } from '../middleware/fileUpload';

const router = Router();

// 提交文本转视频任务
router.post('/text-to-video', submitTextToVideoTask);

// 提交图片转视频任务（需要文件上传）
router.post('/image-to-video', upload.single('image'), submitImageToVideoTask);

// 获取任务列表
router.get('/', getTasks);

// 提交视频生成任务 (通用)
router.post('/submit', submitTask);

// 获取任务状态
router.get('/:taskId/status', getTaskStatus);

// 删除任务
router.delete('/:taskId/delete', deleteTask);

// 取消任务
router.delete('/:taskId', cancelTask);

// 获取队列统计信息
router.get('/stats', getStats);

export default router;
