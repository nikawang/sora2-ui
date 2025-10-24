import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateConfigRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { endpoint, apiKey } = req.body;

  if (!endpoint || typeof endpoint !== 'string') {
    throw new AppError(400, 'Valid endpoint is required');
  }

  if (!apiKey || typeof apiKey !== 'string') {
    throw new AppError(400, 'Valid API key is required');
  }

  // Validate endpoint format
  try {
    const url = new URL(endpoint);
    if (url.protocol !== 'https:') {
      throw new AppError(400, 'Endpoint must use HTTPS protocol');
    }
  } catch {
    throw new AppError(400, 'Invalid endpoint URL format');
  }

  // Validate API key length
  if (apiKey.length < 32 || apiKey.length > 128) {
    throw new AppError(400, 'API key must be between 32 and 128 characters');
  }

  next();
};
