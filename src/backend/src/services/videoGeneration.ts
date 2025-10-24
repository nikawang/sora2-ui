import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { createAzureClient, AzureConfig } from './azureClient';
import { preprocessImage } from './imageProcessor';

/**
 * 视频生成参数接口
 */
export interface VideoGenerationParams {
  model: string;
  prompt?: string;
  imagePath?: string;
  resolution: string; // e.g., "1280x720"
  duration: number; // seconds
}

/**
 * 视频生成结果接口
 */
export interface VideoGenerationResult {
  id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  progress?: number;
  videoUrl?: string;
  error?: string;
}

/**
 * 文本生成视频
 * @param client OpenAI 客户端
 * @param params 生成参数
 * @returns 视频生成任务ID
 */
export async function generateTextToVideo(
  client: OpenAI,
  params: VideoGenerationParams
): Promise<string> {
  if (!params.prompt) {
    throw new Error('Prompt is required for text-to-video generation');
  }

  console.log(`🎬 Generating text-to-video with prompt: "${params.prompt}"`);
  console.log(`   Model: ${params.model}, Resolution: ${params.resolution}, Duration: ${params.duration}s`);

  try {
    const response = await client.videos.create({
      model: params.model as any,
      prompt: params.prompt,
      size: params.resolution as any,
      seconds: params.duration.toString() as any,
    });

    console.log(`✅ Video generation task created: ${response.id}`);
    return response.id;
  } catch (error: any) {
    console.error('❌ Failed to create video generation task:', error);
    throw new Error(`Video generation failed: ${error.message}`);
  }
}

/**
 * 图像生成视频
 * @param client OpenAI 客户端
 * @param params 生成参数
 * @returns 视频生成任务ID
 */
export async function generateImageToVideo(
  client: OpenAI,
  params: VideoGenerationParams
): Promise<string> {
  if (!params.imagePath) {
    throw new Error('Image path is required for image-to-video generation');
  }

  if (!fs.existsSync(params.imagePath)) {
    throw new Error(`Image file not found: ${params.imagePath}`);
  }

  console.log(`🖼️ Generating image-to-video with image: ${params.imagePath}`);
  console.log(`   Prompt: "${params.prompt || 'N/A'}"`);
  console.log(`   Model: ${params.model}, Resolution: ${params.resolution}, Duration: ${params.duration}s`);

  try {
    // 预处理图片：调整尺寸以匹配视频参数
    const processedImagePath = await preprocessImage(params.imagePath, params.resolution);
    
    // 读取图像文件内容并确定 MIME 类型
    const fileExtension = path.extname(processedImagePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    const mimeType = mimeTypes[fileExtension] || 'application/octet-stream';
    
    // 使用 toFile 创建正确的文件对象
    const { toFile } = await import('openai/uploads');
    const fileBuffer = fs.readFileSync(processedImagePath);
    const fileName = path.basename(processedImagePath);
    const imageFile = await toFile(fileBuffer, fileName, { type: mimeType });

    const response = await client.videos.create({
      model: params.model as any,
      prompt: params.prompt || '',
      size: params.resolution as any,
      seconds: params.duration.toString() as any,
      input_reference: imageFile as any,
    });

    console.log(`✅ Video generation task created: ${response.id}`);
    return response.id;
  } catch (error: any) {
    console.error('❌ Failed to create video generation task:', error);
    throw new Error(`Video generation failed: ${error.message}`);
  }
}

/**
 * 获取视频生成任务状态
 * @param client OpenAI 客户端
 * @param videoId 视频任务ID
 * @returns 任务状态信息
 */
export async function getVideoStatus(
  client: OpenAI,
  videoId: string
): Promise<VideoGenerationResult> {
  try {
    const video = await client.videos.retrieve(videoId);

    const result: VideoGenerationResult = {
      id: video.id,
      status: video.status as any,
      progress: (video as any).progress || 0,
    };

    // 如果任务成功完成，获取视频 URL
    if (video.status === 'completed' && (video as any).output?.data?.[0]?.url) {
      result.videoUrl = (video as any).output.data[0].url;
    }

    // 如果任务失败，获取错误信息
    if (video.status === 'failed' && (video as any).error) {
      result.error = (video as any).error.message || 'Unknown error';
    }

    return result;
  } catch (error: any) {
    console.error(`❌ Failed to retrieve video status for ${videoId}:`, error);
    throw new Error(`Failed to get video status: ${error.message}`);
  }
}

/**
 * 轮询视频生成状态直到完成
 * @param client OpenAI 客户端
 * @param videoId 视频任务ID
 * @param onProgress 进度回调函数
 * @param pollInterval 轮询间隔（毫秒）
 * @returns 最终的任务状态
 */
export async function pollVideoStatus(
  client: OpenAI,
  videoId: string,
  onProgress?: (progress: number, status: string) => void,
  pollInterval: number = 2000
): Promise<VideoGenerationResult> {
  console.log(`🔄 Starting to poll video status for ${videoId}`);

  while (true) {
    const result = await getVideoStatus(client, videoId);

    // 调用进度回调
    if (onProgress && result.progress !== undefined) {
      onProgress(result.progress, result.status);
    }

    // 如果任务完成（成功或失败），返回结果
    if (result.status === 'completed' || result.status === 'failed') {
      console.log(`✅ Video generation ${result.status} for ${videoId}`);
      return result;
    }

    // 等待后继续轮询
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
}
