import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const unlink = promisify(fs.unlink);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export class FileService {
  private uploadsDir: string;
  private videosDir: string;

  constructor() {
    this.uploadsDir = path.join(__dirname, '../../uploads');
    this.videosDir = path.join(__dirname, '../../videos');
    
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.uploadsDir, this.videosDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Save uploaded image file
   */
  async saveUploadedImage(file: Express.Multer.File): Promise<string> {
    return file.path;
  }

  /**
   * Save generated video
   */
  async saveGeneratedVideo(taskId: string, videoBuffer: Buffer): Promise<string> {
    const filename = `video-${taskId}.mp4`;
    const filepath = path.join(this.videosDir, filename);
    
    await fs.promises.writeFile(filepath, videoBuffer);
    return filepath;
  }

  /**
   * Get video file path
   * @param filename - 完整的视频文件名或 taskId
   */
  getVideoPath(filename: string): string {
    // 如果传入的是完整文件名（包含.mp4），直接使用
    if (filename.endsWith('.mp4')) {
      return path.join(this.videosDir, filename);
    }
    // 否则假设是 taskId，构造文件名
    return path.join(this.videosDir, `video-${filename}.mp4`);
  }

  /**
   * Check if video exists
   * @param filename - 完整的视频文件名或 taskId
   */
  async videoExists(filename: string): Promise<boolean> {
    const filepath = this.getVideoPath(filename);
    try {
      await stat(filepath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(filepath: string): Promise<void> {
    try {
      await unlink(filepath);
    } catch (error) {
      console.error(`Error deleting file ${filepath}:`, error);
    }
  }

  /**
   * Clean up old files (older than 24 hours)
   */
  async cleanupOldFiles(): Promise<void> {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const dir of [this.uploadsDir, this.videosDir]) {
      try {
        const files = await readdir(dir);
        
        for (const file of files) {
          const filepath = path.join(dir, file);
          const stats = await stat(filepath);
          
          if (now - stats.mtimeMs > maxAge) {
            await this.deleteFile(filepath);
            console.log(`Cleaned up old file: ${filepath}`);
          }
        }
      } catch (error) {
        console.error(`Error cleaning up directory ${dir}:`, error);
      }
    }
  }
}

export const fileService = new FileService();
