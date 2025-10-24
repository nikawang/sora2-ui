import Queue from 'bull';
import type { Job } from 'bull';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

// 视频生成任务数据接口
export interface VideoGenerationJobData {
  taskId: string;
  type: 'text2video' | 'image2video';
  prompt?: string;
  imagePath?: string;
  parameters: {
    model: string;
    resolution: string;
    duration: number;
  };
  azureConfig: {
    endpoint: string;
    apiKey: string;
  };
}

// 任务结果接口
export interface VideoGenerationResult {
  taskId: string;
  videoUrl: string;
  videoPath: string;
  status: 'completed' | 'failed';
  error?: string;
}

// Redis 配置
const redisConfig = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// 创建视频生成队列
export const videoQueue = new Queue<VideoGenerationJobData>('video-generation', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: false,
    removeOnFail: false,
  },
});

// 队列事件监听
videoQueue.on('completed', (job: Job<VideoGenerationJobData>, result: VideoGenerationResult) => {
  console.log(`✅ Job ${job.id} completed:`, result);
});

videoQueue.on('failed', (job: Job<VideoGenerationJobData>, err: Error) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

videoQueue.on('progress', (job: Job<VideoGenerationJobData>, progress: number) => {
  console.log(`📊 Job ${job.id} progress: ${progress}%`);
});

videoQueue.on('stalled', (job: Job<VideoGenerationJobData>) => {
  console.warn(`⚠️ Job ${job.id} has stalled`);
});

/**
 * 关闭队列连接
 */
export async function closeQueue(): Promise<void> {
  await videoQueue.close();
  console.log('✅ Queue closed');
}

// 添加任务到队列
export const addVideoGenerationJob = async (
  data: VideoGenerationJobData
): Promise<string> => {
  const job = await videoQueue.add(data, {
    jobId: data.taskId, // 使用 taskId 作为 jobId，便于查询
  });
  
  console.log(`📋 Added job ${job.id} to queue`);
  return job.id as string;
};

// 获取任务状态
export const getJobStatus = async (jobId: string) => {
  const job = await videoQueue.getJob(jobId);
  
  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress();
  const result = job.returnvalue;
  const failedReason = job.failedReason;

  return {
    id: job.id,
    state,
    progress,
    result,
    failedReason,
    data: job.data,
    attemptsMade: job.attemptsMade,
    finishedOn: job.finishedOn,
    processedOn: job.processedOn,
  };
};

// 取消任务
export const cancelJob = async (jobId: string): Promise<boolean> => {
  const job = await videoQueue.getJob(jobId);
  
  if (!job) {
    return false;
  }

  await job.remove();
  console.log(`🗑️ Job ${jobId} cancelled and removed`);
  return true;
};

// 获取队列统计信息
export const getQueueStats = async () => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    videoQueue.getWaitingCount(),
    videoQueue.getActiveCount(),
    videoQueue.getCompletedCount(),
    videoQueue.getFailedCount(),
    videoQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
};

// 获取所有任务
export const getAllJobs = async () => {
  const [waiting, active, completed, failed] = await Promise.all([
    videoQueue.getWaiting(),
    videoQueue.getActive(),
    videoQueue.getCompleted(),
    videoQueue.getFailed(),
  ]);

  return [...waiting, ...active, ...completed, ...failed].sort((a, b) => {
    return (b.timestamp || 0) - (a.timestamp || 0);
  });
};

// 清理已完成的旧任务（保留最近24小时）
export const cleanOldJobs = async () => {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  await videoQueue.clean(oneDayAgo, 'completed');
  await videoQueue.clean(oneDayAgo, 'failed');
  
  console.log('🧹 Cleaned old jobs');
};
