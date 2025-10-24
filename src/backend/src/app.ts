import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:49399'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// 静态文件服务 - 提供生成的视频文件
app.use('/api/videos', express.static(path.join(process.cwd(), 'videos')));

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Sora Web UI API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      config: '/api/config',
      files: '/api/files',
      tasks: '/api/tasks',
    },
  });
});

// API routes
app.use('/api', apiRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
