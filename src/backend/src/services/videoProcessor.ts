import { taskManager, Task } from './taskManager';
import { createAzureClient } from './azureClient';
import { generateTextToVideo, generateImageToVideo, pollVideoStatus } from './videoGeneration';
import { downloadVideo } from './videoDownload';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 视频处理器 - 处理视频生成任务
 */
class VideoProcessor {
  private isRunning = false;

  /**
   * 启动处理器
   */
  start(): void {
    if (this.isRunning) {
      console.log('⚠️ Video processor is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Video processor started');

    // 监听新任务
    console.log('🔍 DEBUG: Registering task:started listener');
    taskManager.on('task:started', (task: Task) => {
      console.log('🔍 DEBUG: task:started event received for task:', task.id);
      this.processTask(task);
    });
    console.log('🔍 DEBUG: Listener registered, count:', taskManager.listenerCount('task:started'));
  }

  /**
   * 停止处理器
   */
  stop(): void {
    this.isRunning = false;
    console.log('🛑 Video processor stopped');
  }

  /**
   * 处理单个任务
   */
  private async processTask(task: Task): Promise<void> {
    try {
      console.log(`🎬 Processing task ${task.id}: ${task.type}`);

      // 更新进度: 初始化
      taskManager.updateProgress(task.id, 5);

      // 创建 Azure 客户端
      const client = createAzureClient(task.azureConfig);
      
      // 更新进度: 准备中
      taskManager.updateProgress(task.id, 10);

      // 根据类型生成视频
      let videoGenerationResult;
      
      if (task.type === 'text2video') {
        // 文本转视频
        console.log(`📝 Generating video from text: "${task.prompt}"`);
        videoGenerationResult = await generateTextToVideo(client, {
          prompt: task.prompt || '',
          model: task.parameters.model,
          resolution: task.parameters.resolution,
          duration: task.parameters.duration,
        });
      } else {
        // 图片转视频
        console.log(`🖼️ Generating video from image: ${task.imagePath}`);
        if (!task.imagePath || !fs.existsSync(task.imagePath)) {
          throw new Error('Image file not found');
        }
        videoGenerationResult = await generateImageToVideo(client, {
          imagePath: task.imagePath,
          prompt: task.prompt || '',
          model: task.parameters.model,
          resolution: task.parameters.resolution,
          duration: task.parameters.duration,
        });
      }

      // 更新进度: 提交成功
      taskManager.updateProgress(task.id, 20);

      // 轮询状态直到完成
      const finalResult = await pollVideoStatus(
        client,
        videoGenerationResult,  // videoGenerationResult 就是视频 ID 字符串
        (progress) => {
          // 映射进度 20-90
          const mappedProgress = 20 + (progress * 0.7);
          taskManager.updateProgress(task.id, mappedProgress);
        }
      );

      if (finalResult.status !== 'completed') {
        throw new Error(finalResult.error || 'Video generation failed');
      }

      // 更新进度: 下载中
      taskManager.updateProgress(task.id, 90);

      // 生成输出文件路径
      const timestamp = new Date().getTime();
      const videoFileName = `video-${task.id}-${timestamp}.mp4`;
      const videoPath = path.join(process.cwd(), 'videos', videoFileName);
      
      // 下载视频
      await downloadVideo(client, finalResult.id, videoPath);
      
      // 构建视频 URL（使用完整的后端 URL）
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
      const videoUrl = `${backendUrl}/api/files/video/${videoFileName}`;

      // 完成任务
      taskManager.completeTask(task.id, {
        videoId: finalResult.id, // 保存 OpenAI video ID
        videoUrl,
        videoPath,
      });

    } catch (error) {
      console.error(`❌ Task ${task.id} failed:`, error);
      taskManager.failTask(
        task.id,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}

// 导出单例
export const videoProcessor = new VideoProcessor();
