/**
 * LocalStorage 服务 - 用于持久化视频生成历史记录
 */

export interface VideoHistoryItem {
  taskId: string;
  videoId: string; // OpenAI video ID
  type: 'text2video' | 'image2video';
  prompt: string;
  inputImage?: string; // Base64 编码的图片（如果是图生视频）
  parameters: {
    model: string;
    resolution: string;
    duration: number;
  };
  status: 'completed' | 'failed';
  videoUrl?: string; // 本地视频 URL
  error?: string;
  createdAt: string;
  completedAt?: string;
}

const STORAGE_KEY = 'sora_video_history';
const MAX_HISTORY_ITEMS = 100;

/**
 * 获取所有历史记录
 */
export function getVideoHistory(): VideoHistoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to get video history:', error);
    return [];
  }
}

/**
 * 添加历史记录
 */
export function addVideoHistory(item: VideoHistoryItem): void {
  try {
    const history = getVideoHistory();
    // 添加到开头
    history.unshift(item);
    // 限制最大数量
    const limitedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Failed to add video history:', error);
  }
}

/**
 * 更新历史记录项
 */
export function updateVideoHistory(taskId: string, updates: Partial<VideoHistoryItem>): void {
  try {
    const history = getVideoHistory();
    const index = history.findIndex(item => item.taskId === taskId);
    if (index !== -1) {
      history[index] = { ...history[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  } catch (error) {
    console.error('Failed to update video history:', error);
  }
}

/**
 * 通过 taskId 获取历史记录
 */
export function getVideoHistoryItem(taskId: string): VideoHistoryItem | null {
  try {
    const history = getVideoHistory();
    return history.find(item => item.taskId === taskId) || null;
  } catch (error) {
    console.error('Failed to get video history item:', error);
    return null;
  }
}

/**
 * 删除历史记录
 */
export function deleteVideoHistory(taskId: string): void {
  try {
    const history = getVideoHistory();
    const filtered = history.filter(item => item.taskId !== taskId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete video history:', error);
  }
}

/**
 * 清空所有历史记录
 */
export function clearVideoHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear video history:', error);
  }
}

/**
 * 将图片文件转换为 Base64
 */
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
