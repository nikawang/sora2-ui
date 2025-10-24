import { Request, Response } from 'express';
import { createAzureClient } from '../services/azureClient';
import { downloadVideo } from '../services/videoDownload';
import * as path from 'path';

/**
 * 重新下载视频（通过 OpenAI video ID）
 */
export async function redownloadVideo(req: Request, res: Response) {
  try {
    const { videoId } = req.params;
    
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Video ID is required',
      });
    }

    // 从环境变量获取 Azure 配置（使用固定值作为默认）
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT ;
    const apiKey = process.env.AZURE_OPENAI_API_KEY ;

    console.log(`🔧 Using Azure endpoint: ${endpoint}`);
    console.log(`🔧 API key length: ${apiKey?.length || 0}`);

    if (!endpoint || !apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Azure OpenAI configuration is missing',
      });
    }

    // 创建 Azure 客户端
    const client = createAzureClient({ endpoint, apiKey });

    // 生成输出文件路径
    const timestamp = new Date().getTime();
    const videoFileName = `video-redownload-${videoId}-${timestamp}.mp4`;
    const videoPath = path.join(process.cwd(), 'videos', videoFileName);

    console.log(`📥 Re-downloading video ${videoId}...`);

    // 下载视频
    await downloadVideo(client, videoId, videoPath);

    console.log(`✅ Video re-downloaded successfully: ${videoFileName}`);

    // 返回新的视频文件名（使用完整的后端 URL）
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    return res.json({
      success: true,
      data: {
        videoId,
        videoFileName,
        videoUrl: `${backendUrl}/api/files/video/${videoFileName}`,
      },
      message: 'Video re-downloaded successfully',
    });
  } catch (error: any) {
    console.error('Re-download video error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to re-download video',
    });
  }
}
