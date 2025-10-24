export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ConfigValidationRequest {
  endpoint: string;
  apiKey: string;
}

export interface VideoGenerationRequest {
  type: 'text2video' | 'image2video';
  prompt?: string;
  imagePath?: string;
  parameters: {
    model: string;
    size: string;
    seconds: string;
  };
  azureConfig: {
    endpoint: string;
    apiKey: string;
  };
}

export interface TaskUpdate {
  taskId: string;
  status: string;
  progress: number;
  message?: string;
  error?: string;
}
