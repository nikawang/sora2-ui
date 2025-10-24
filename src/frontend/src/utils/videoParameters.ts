/**
 * 视频参数配置常量
 */

// 分辨率选项 - Sora API 支持的分辨率（Text to Video 和 Image to Video 通用）
export const RESOLUTION_OPTIONS = [
  { value: '1280x720', label: '720p Landscape (1280x720)', width: 1280, height: 720 },
  { value: '720x1280', label: '720p Portrait (720x1280)', width: 720, height: 1280 },
  { value: '1792x1024', label: 'Wide Landscape (1792x1024)', width: 1792, height: 1024 },
  { value: '1024x1792', label: 'Tall Portrait (1024x1792)', width: 1024, height: 1792 },
];

// Image to Video 使用相同的分辨率选项
export const IMAGE_TO_VIDEO_RESOLUTION_OPTIONS = RESOLUTION_OPTIONS;

// 时长选项（秒）
export const DURATION_OPTIONS = [
  { value: 4, label: '4 seconds', description: 'Quick clip' },
  { value: 8, label: '8 seconds', description: 'Standard' },
  { value: 12, label: '12 seconds', description: 'Extended' },
];

// 模型选项
export const MODEL_OPTIONS = [
  { 
    value: 'sora-2', 
    label: 'Sora 2', 
    description: 'Latest generation model',
    isRecommended: true 
  },
];

// 参数预设模板
export interface ParameterPreset {
  name: string;
  description: string;
  icon: string;
  parameters: {
    resolution: string;
    duration: number;
    model: string;
  };
}

export const PARAMETER_PRESETS: ParameterPreset[] = [
  {
    name: 'Quick Landscape',
    description: '快速横屏短视频',
    icon: '⚡',
    parameters: {
      resolution: '1280x720',
      duration: 4,
      model: 'sora-2',
    },
  },
  {
    name: 'Standard Landscape',
    description: '标准横屏视频',
    icon: '🎬',
    parameters: {
      resolution: '1792x1024',
      duration: 8,
      model: 'sora-2',
    },
  },
  {
    name: 'Extended Landscape',
    description: '扩展横屏视频',
    icon: '🎥',
    parameters: {
      resolution: '1280x720',
      duration: 12,
      model: 'sora-2',
    },
  },
  {
    name: 'Portrait Video',
    description: '竖屏视频（适合手机）',
    icon: '📱',
    parameters: {
      resolution: '720x1280',
      duration: 8,
      model: 'sora-2',
    },
  },
];

// 参数验证函数
export function validateParameters(parameters: {
  resolution: string;
  duration: number;
  model: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证分辨率
  const validResolutions = RESOLUTION_OPTIONS.map(opt => opt.value);
  if (!validResolutions.includes(parameters.resolution)) {
    errors.push(`Invalid resolution: ${parameters.resolution}`);
  }

  // 验证时长
  const validDurations = DURATION_OPTIONS.map(opt => opt.value);
  if (!validDurations.includes(parameters.duration)) {
    errors.push(`Invalid duration: ${parameters.duration}`);
  }

  // 验证模型
  const validModels = MODEL_OPTIONS.map(opt => opt.value);
  if (!validModels.includes(parameters.model)) {
    errors.push(`Invalid model: ${parameters.model}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// 获取分辨率显示名称
export function getResolutionLabel(resolution: string): string {
  const option = RESOLUTION_OPTIONS.find(opt => opt.value === resolution);
  return option?.label || resolution;
}

// 获取时长显示名称
export function getDurationLabel(duration: number): string {
  const option = DURATION_OPTIONS.find(opt => opt.value === duration);
  return option?.label || `${duration}s`;
}

// 获取模型显示名称
export function getModelLabel(model: string): string {
  const option = MODEL_OPTIONS.find(opt => opt.value === model);
  return option?.label || model;
}
