import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

/**
 * 下载视频内容并保存到文件
 * @param client OpenAI 客户端
 * @param videoId 视频任务ID
 * @param outputPath 输出文件路径
 * @returns 保存的文件路径
 */
export async function downloadVideo(
  client: OpenAI,
  videoId: string,
  outputPath: string
): Promise<string> {
  console.log(`📥 Downloading video ${videoId} to ${outputPath}`);

  try {
    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 下载视频内容
    const content = await client.videos.downloadContent(videoId, { variant: 'video' as any });

    // 将内容转换为 Buffer 并保存到文件
    const buffer = await (content as any).arrayBuffer();
    const videoBuffer = Buffer.from(buffer);
    
    fs.writeFileSync(outputPath, videoBuffer);

    console.log(`✅ Video downloaded successfully to ${outputPath}`);
    
    // 验证文件是否存在且有内容
    const stats = fs.statSync(outputPath);
    console.log(`📊 Video file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    return outputPath;
  } catch (error: any) {
    console.error(`❌ Failed to download video ${videoId}:`, error);
    throw new Error(`Video download failed: ${error.message}`);
  }
}

/**
 * 下载视频并返回 Buffer
 * @param client OpenAI 客户端
 * @param videoId 视频任务ID
 * @returns 视频内容的 Buffer
 */
export async function downloadVideoToBuffer(
  client: OpenAI,
  videoId: string
): Promise<Buffer> {
  console.log(`📥 Downloading video ${videoId} to buffer`);

  try {
    const content = await client.videos.downloadContent(videoId, { variant: 'video' as any });
    
    // 将内容转换为 Buffer
    const buffer = await (content as any).arrayBuffer();
    const videoBuffer = Buffer.from(buffer);

    console.log(`✅ Video downloaded to buffer: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    return videoBuffer;
  } catch (error: any) {
    console.error(`❌ Failed to download video ${videoId} to buffer:`, error);
    throw new Error(`Video download failed: ${error.message}`);
  }
}

/**
 * 生成视频文件名
 * @param taskId 任务ID
 * @param timestamp 时间戳（可选）
 * @returns 文件名
 */
export function generateVideoFileName(taskId: string, timestamp?: number): string {
  const ts = timestamp || Date.now();
  return `video-${taskId}-${ts}.mp4`;
}

/**
 * 获取视频保存路径
 * @param fileName 文件名
 * @param baseDir 基础目录（默认为 videos/）
 * @returns 完整路径
 */
export function getVideoPath(fileName: string, baseDir: string = 'videos'): string {
  return path.join(process.cwd(), baseDir, fileName);
}

/**
 * 检查视频文件是否存在
 * @param filePath 文件路径
 * @returns 文件是否存在
 */
export function videoFileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * 删除视频文件
 * @param filePath 文件路径
 */
export function deleteVideoFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`🗑️ Deleted video file: ${filePath}`);
  }
}
