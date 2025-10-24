import { useState, useEffect, useRef } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useConfigStore } from '../store/useConfigStore';
import { taskApi } from '../services/api';
import { addVideoHistory, imageToBase64 } from '../services/localStorage';
import type { VideoParameters, VideoGenerationTask } from '../types/task';

export function useVideoGeneration() {
  const { config } = useConfigStore();
  const { currentTask, setCurrentTask, addToHistory, updateTaskStatus, updateTaskProgress } = useTaskStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const pollIntervalRef = useRef<number | null>(null);

  // 轮询任务状态
  useEffect(() => {
    if (currentTask && ['queued', 'processing'].includes(currentTask.status)) {
      // 开始轮询
      pollIntervalRef.current = setInterval(async () => {
        try {
          const response = await taskApi.getTaskStatus(currentTask.id);
          if (response.success && response.data) {
            // 更新任务状态和进度
            updateTaskStatus(currentTask.id, response.data.status);
            
            if (response.data.progress !== undefined) {
              updateTaskProgress(currentTask.id, response.data.progress);
              const updatedTask: VideoGenerationTask = {
                ...currentTask,
                status: response.data.status,
                progress: response.data.progress,
                resultVideoUrl: response.data.videoPath ? `/api/videos/${response.data.videoPath}` : undefined,
                error: response.data.error,
              };
              setCurrentTask(updatedTask);
            }
            
            // 如果任务完成，更新视频 URL
            if (response.data.status === 'completed' && response.data.videoPath) {
              const videoPath = response.data.videoPath.split('/').pop();
              if (videoPath) {
                const completedAt = new Date().toISOString();
                const updatedTask: VideoGenerationTask = {
                  ...currentTask,
                  status: 'completed',
                  progress: 100,
                  resultVideoUrl: `/api/videos/${videoPath}`,
                  completedAt,
                };
                setCurrentTask(updatedTask);
                
                // 保存到 localStorage
                const videoId = response.data.result?.videoId;
                if (videoId) {
                  addVideoHistory({
                    taskId: currentTask.id,
                    videoId: videoId,
                    type: currentTask.type,
                    prompt: currentTask.prompt || '',
                    inputImage: currentTask.type === 'image2video' ? imageBase64 : undefined,
                    parameters: currentTask.parameters,
                    status: 'completed',
                    videoUrl: `/api/videos/${videoPath}`,
                    createdAt: currentTask.createdAt,
                    completedAt: completedAt,
                  });
                  console.log(`Video history saved: ${videoId}`);
                }
              }
            }
            
            // 如果任务失败，更新错误信息
            if (response.data.status === 'failed' && response.data.error) {
              const updatedTask: VideoGenerationTask = {
                ...currentTask,
                status: 'failed',
                error: response.data.error,
              };
              setCurrentTask(updatedTask);
            }
            
            // 如果任务完成或失败，停止轮询
            if (['completed', 'failed', 'cancelled'].includes(response.data.status)) {
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
            }
          }
        } catch (error) {
          console.error('Failed to poll task status:', error);
        }
      }, 2000); // 每2秒轮询一次

      // 清理函数
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    }
  }, [currentTask?.id, currentTask?.status]);

  const generateTextToVideo = async (prompt: string, parameters: VideoParameters) => {
    if (!config?.isConnected) {
      setError('Please configure Azure OpenAI connection first');
      return false;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Pass azureConfig from the store
      const azureConfig = config ? {
        endpoint: config.endpoint,
        apiKey: config.apiKey
      } : undefined;
      
      const response = await taskApi.submitTextToVideo(prompt, parameters, azureConfig);
      
      if (response.success && response.data) {
        const task: VideoGenerationTask = {
          id: response.data.taskId,
          type: 'text2video',
          prompt,
          parameters,
          status: 'queued',
          progress: 0,
          createdAt: new Date().toISOString(),
        };

        setCurrentTask(task);
        addToHistory(task);
        setIsSubmitting(false);
        return true;
      } else {
        setError(response.error || 'Failed to submit task');
        setIsSubmitting(false);
        return false;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      setIsSubmitting(false);
      return false;
    }
  };

  const generateImageToVideo = async (imageFile: File, prompt: string, parameters: VideoParameters) => {
    if (!config?.isConnected) {
      setError('Please configure Azure OpenAI connection first');
      return false;
    }

    if (!imageFile) {
      setError('Please select an image');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 将图片转换为 base64，用于后续保存到 localStorage
      const base64Image = await imageToBase64(imageFile);
      setImageBase64(base64Image);
      
      // Pass azureConfig from the store
      const azureConfig = config ? {
        endpoint: config.endpoint,
        apiKey: config.apiKey
      } : undefined;
      
      const response = await taskApi.submitImageToVideo(imageFile, prompt, parameters, azureConfig);
      
      if (response.success && response.data) {
        const task: VideoGenerationTask = {
          id: response.data.taskId,
          type: 'image2video',
          prompt,
          parameters,
          status: 'queued',
          progress: 0,
          createdAt: new Date().toISOString(),
        };

        setCurrentTask(task);
        addToHistory(task);
        setIsSubmitting(false);
        return true;
      } else {
        setError(response.error || 'Failed to submit task');
        setIsSubmitting(false);
        return false;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      setIsSubmitting(false);
      return false;
    }
  };

  return {
    generateTextToVideo,
    generateImageToVideo,
    isSubmitting,
    error,
    hasValidConfig: config?.isConnected ?? false,
  };
}