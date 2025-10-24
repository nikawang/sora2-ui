import axios from 'axios';
import type { ApiResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Unknown error';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;

// Config API
export const configApi = {
  validateConnection: async (endpoint: string, apiKey: string): Promise<ApiResponse<boolean>> => {
    try {
      const response = await apiClient.post<any, ApiResponse<boolean>>('/api/config/validate', {
        endpoint,
        apiKey,
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  },
};

// Task API
export const taskApi = {
  // 提交文本转视频任务
  submitTextToVideo: async (prompt: string, parameters: any, azureConfig?: { endpoint: string; apiKey: string }): Promise<ApiResponse<{ taskId: string }>> => {
    try {
      const response = await apiClient.post<any, ApiResponse<{ taskId: string }>>('/api/tasks/text-to-video', {
        prompt,
        parameters,
        azureConfig,
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit task',
      };
    }
  },

  // 提交图片转视频任务
  submitImageToVideo: async (imageFile: File, prompt: string, parameters: any, azureConfig?: { endpoint: string; apiKey: string }): Promise<ApiResponse<{ taskId: string }>> => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('prompt', prompt);
      formData.append('parameters', JSON.stringify(parameters));
      if (azureConfig) {
        formData.append('azureConfig', JSON.stringify(azureConfig));
      }

      const response = await apiClient.post<any, ApiResponse<{ taskId: string }>>('/api/tasks/image-to-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit task',
      };
    }
  },

  // 获取任务状态
  getTaskStatus: async (taskId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.get<any, ApiResponse<any>>(`/api/tasks/${taskId}/status`);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get task status',
      };
    }
  },

  // 获取任务列表
  getTasks: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await apiClient.get<any, ApiResponse<any[]>>('/api/tasks');
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get tasks',
      };
    }
  },

  // 删除任务
  deleteTask: async (taskId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete<any, ApiResponse<void>>(`/api/tasks/${taskId}/delete`);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete task',
      };
    }
  },
};

// Video API
export const videoApi = {
  // 重新下载视频
  redownloadVideo: async (videoId: string): Promise<ApiResponse<{ videoId: string; videoFileName: string; videoUrl: string }>> => {
    try {
      const response = await apiClient.post<any, ApiResponse<{ videoId: string; videoFileName: string; videoUrl: string }>>(
        `/api/video/redownload/${videoId}`
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to redownload video',
      };
    }
  },
};
