import app from './app';
import { videoProcessor } from './services/videoProcessor';

const PORT = process.env.PORT || 8080;

// 启动服务器
async function startServer() {
  try {
    // 启动视频处理器
    videoProcessor.start();

    // 启动 HTTP 服务器
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`📋 Tasks API: http://localhost:${PORT}/api/tasks`);
    });

    // 优雅关闭
    const shutdown = async (signal: string) => {
      console.log(`${signal} signal received: closing server`);
      
      // 停止接收新连接
      server.close(async () => {
        console.log('HTTP server closed');
        
        try {
          // 停止视频处理器
          videoProcessor.stop();
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
