import { Job } from 'bull';
import { videoQueue, VideoGenerationJobData, VideoGenerationResult } from '../services/queueService';
import { createAzureClient } from '../services/azureClient';
import {
  generateTextToVideo,
  generateImageToVideo,
  pollVideoStatus,
  VideoGenerationParams,
} from '../services/videoGeneration';
import {
  downloadVideo,
  generateVideoFileName,
  getVideoPath,
} from '../services/videoDownload';
import { cleanupProcessedImage } from '../services/imageProcessor';

/**
 * 真实的视频生成过程 - 调用 Azure OpenAI API
 */
async function generateVideo(data: VideoGenerationJobData, job: Job): Promise<VideoGenerationResult> {
  const { taskId, type, prompt, imagePath, parameters, azureConfig } = data;

  console.log(`🎬 Starting video generation for task ${taskId}`);
  console.log(`Type: ${type}, Model: ${parameters.model}, Resolution: ${parameters.resolution}`);

  try {
    // 初始化进度
    await job.progress(5);
    console.log(`📊 Task ${taskId}: 5% - Initializing Azure client`);

    // 创建 Azure OpenAI 客户端
    const client = createAzureClient(azureConfig);

    await job.progress(10);
    console.log(`📊 Task ${taskId}: 10% - Preparing video generation request`);

    // 准备视频生成参数
    const genParams: VideoGenerationParams = {
      model: parameters.model,
      prompt: prompt,
      imagePath: imagePath,
      resolution: parameters.resolution,
      duration: parameters.duration,
    };

    // 根据类型调用相应的生成函数
    let videoId: string;
    if (type === 'text2video') {
      videoId = await generateTextToVideo(client, genParams);
    } else if (type === 'image2video') {
      videoId = await generateImageToVideo(client, genParams);
    } else {
      throw new Error(`Unknown video generation type: ${type}`);
    }

    await job.progress(20);
    console.log(`📊 Task ${taskId}: 20% - Video generation task submitted: ${videoId}`);

    // 轮询视频生成状态
    const finalStatus = await pollVideoStatus(
      client,
      videoId,
      (progress, status) => {
        // 将 Azure 的进度映射到 20-90% 范围
        const mappedProgress = 20 + (progress * 0.7);
        job.progress(Math.round(mappedProgress));
        console.log(`📊 Task ${taskId}: ${Math.round(mappedProgress)}% - ${status} (Azure progress: ${progress}%)`);
      }
    );

    // 检查是否成功
    if (finalStatus.status === 'failed') {
      throw new Error(finalStatus.error || 'Video generation failed on Azure');
    }

    if (!finalStatus.videoUrl) {
      throw new Error('Video URL not available from Azure');
    }

    await job.progress(90);
    console.log(`📊 Task ${taskId}: 90% - Downloading video from Azure`);

    // 下载视频
    const videoFilename = generateVideoFileName(taskId);
    const videoPath = getVideoPath(videoFilename);
    
    await downloadVideo(client, videoId, videoPath);

    await job.progress(100);
    console.log(`✅ Task ${taskId}: 100% - Completed`);

    // 清理处理后的临时图片
    if (imagePath) {
      cleanupProcessedImage(imagePath);
    }

    // 使用完整的后端 URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    return {
      taskId,
      videoUrl: `${backendUrl}/api/files/video/${videoFilename}`,
      videoPath,
      status: 'completed',
    };
  } catch (error: any) {
    console.error(`❌ Task ${taskId} failed:`, error);
    
    // 即使失败也清理临时图片
    if (imagePath) {
      cleanupProcessedImage(imagePath);
    }
    
    return {
      taskId,
      videoUrl: '',
      videoPath: '',
      status: 'failed',
      error: error.message || 'Unknown error',
    };
  }
}

// 处理队列任务
export function startWorker() {
  console.log('🔄 Video generation worker started');

  videoQueue.process(async (job: Job<VideoGenerationJobData>) => {
    console.log(`🚀 Processing job ${job.id}`);
    
    const result = await generateVideo(job.data, job);
    
    if (result.status === 'failed') {
      throw new Error(result.error || 'Video generation failed');
    }
    
    return result;
  });

  // Worker 事件监听
  videoQueue.on('error', (error) => {
    console.error('Worker error:', error);
  });

  console.log('👷 Worker is ready to process jobs');
}

// 优雅停止 worker
export async function stopWorker() {
  console.log('Stopping worker...');
  await videoQueue.close();
  console.log('Worker stopped');
}
