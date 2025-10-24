import { Request, Response } from 'express';
import { ConfigValidationRequest, ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';
import { testAzureConnection } from '../services/azureClient';

export const validateConfig = async (
  req: Request<{}, {}, ConfigValidationRequest>,
  res: Response<ApiResponse<boolean>>
) => {
  const { endpoint, apiKey } = req.body;

  try {
    // 验证 endpoint 格式
    const url = new URL(endpoint);
    
    if (!url.hostname.includes('openai.azure.com')) {
      throw new AppError(400, 'Endpoint must be an Azure OpenAI endpoint');
    }

    // 使用真实的 API 调用测试连接（调用 videos.list API）
    console.log('🧪 Validating Azure OpenAI configuration...');
    const isValid = await testAzureConnection({
      endpoint,
      apiKey
    });
    
    if (!isValid) {
      throw new AppError(401, 'Failed to connect to Azure OpenAI. Please check your endpoint and API key.');
    }
    
    res.json({
      success: true,
      data: true,
      message: 'Configuration validated successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Configuration validation error:', error);
    throw new AppError(400, 'Invalid configuration or connection failed');
  }
};
