export type TaskType = 'text2video' | 'image2video';
export type TaskStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed';

export interface VideoParameters {
  resolution: string;
  duration: number;
  model: string;
}

export interface VideoGenerationTask {
  id: string;
  type: TaskType;
  prompt?: string;
  imageFile?: File;
  imagePath?: string;
  parameters: VideoParameters;
  status: TaskStatus;
  progress: number;
  createdAt: string;
  completedAt?: string;
  resultVideoUrl?: string;
  error?: string;
}
