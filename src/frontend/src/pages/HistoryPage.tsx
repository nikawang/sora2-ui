import { useState, useEffect } from 'react';
import { 
  getVideoHistory, 
  deleteVideoHistory,
  type VideoHistoryItem 
} from '../services/localStorage';
import { useTaskStore } from '../store/useTaskStore';
import { taskApi } from '../services/api';
import type { VideoGenerationTask } from '../types/task';

// 合并的历史项类型
type CombinedHistoryItem = VideoHistoryItem | (VideoGenerationTask & { isActive?: boolean });

export function HistoryPage() {
  const [history, setHistory] = useState<VideoHistoryItem[]>([]);
  const [activeTasks, setActiveTasks] = useState<VideoGenerationTask[]>([]);
  
  // 从 store 获取当前任务和历史任务
  const { currentTask, history: taskHistory, removeFromHistory } = useTaskStore();

  useEffect(() => {
    loadHistory();
    loadActiveTasks(); // 加载活跃任务
    
    // 每 2 秒刷新一次活跃任务状态
    const interval = window.setInterval(() => {
      loadActiveTasks();
    }, 2000);
    
    return () => {
      clearInterval(interval);
    };
  }, []); // 空依赖数组，只在组件挂载时执行一次

  const loadHistory = async () => {
    const items = getVideoHistory();
    setHistory(items);
  };
  
  // 从后端加载所有任务（包括进行中和已完成的）
  const loadActiveTasks = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/tasks');
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          // 保存所有任务（前端会根据状态处理）
          setActiveTasks(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to load active tasks:', err);
    }
  };
  
  // 合并后端任务和 localStorage 历史
  const getCombinedHistory = (): CombinedHistoryItem[] => {
    const combined: CombinedHistoryItem[] = [];
    const processedTaskIds = new Set<string>();
    
    // 首先添加从后端获取的所有任务（优先级最高，实时数据）
    activeTasks.forEach(task => {
      const isActive = ['queued', 'processing', 'active'].includes(task.status);
      combined.push({ ...task, isActive });
      processedTaskIds.add(task.id);
    });
    
    // 添加 currentTask（如果存在且未在 activeTasks 中）
    if (currentTask && !processedTaskIds.has(currentTask.id)) {
      const isActive = ['queued', 'processing', 'active'].includes(currentTask.status);
      combined.push({ ...currentTask, isActive });
      processedTaskIds.add(currentTask.id);
    }
    
    // 添加 taskHistory 中的其他任务
    taskHistory.forEach(task => {
      if (!processedTaskIds.has(task.id)) {
        const isActive = ['queued', 'processing', 'active'].includes(task.status);
        combined.push({ ...task, isActive });
        processedTaskIds.add(task.id);
      }
    });
    
    // 最后添加 localStorage 中的历史记录（排除已从后端获取的任务）
    history.forEach(item => {
      if (!processedTaskIds.has(item.taskId)) {
        combined.push(item);
      }
    });
    
    return combined;
  };

  const handleDelete = async (taskId: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      try {
        // 1. 从 localStorage 删除
        deleteVideoHistory(taskId);
        
        // 2. 从 Zustand store 删除
        removeFromHistory(taskId);
        
        // 3. 从后端删除任务
        await taskApi.deleteTask(taskId);
        
        // 4. 立即更新本地状态（先移除，避免等待）
        setHistory(prev => prev.filter(item => item.taskId !== taskId));
        setActiveTasks(prev => prev.filter(task => task.id !== taskId));
        
        // 5. 重新加载以确保同步（等待 Promise 完成）
        await Promise.all([
          loadHistory(),
          loadActiveTasks()
        ]);
      } catch (error) {
        console.error('Failed to delete task:', error);
        // 如果删除失败，重新加载以恢复状态
        await Promise.all([
          loadHistory(),
          loadActiveTasks()
        ]);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeBadge = (type: 'text2video' | 'image2video') => {
    if (type === 'text2video') {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
          文生视频
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
        图生视频
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 标题栏 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">视频生成历史</h1>
        </div>

        {/* 历史记录列表 */}
        {getCombinedHistory().length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">暂无视频生成历史</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCombinedHistory().map((item) => {
              // 判断是否为活跃任务
              const isActive = 'isActive' in item && item.isActive;
              const taskId = 'taskId' in item ? item.taskId : item.id;
              
              // 从不同来源提取 videoId 和 videoUrl
              const videoId = 'videoId' in item 
                ? item.videoId 
                : ('result' in item && item.result ? (item.result as any).videoId : undefined);
              
              const inputImage = 'inputImage' in item ? item.inputImage : undefined;
              
              const videoUrl = 'videoUrl' in item 
                ? item.videoUrl 
                : ('resultVideoUrl' in item 
                  ? item.resultVideoUrl 
                  : ('result' in item && item.result ? (item.result as any).videoUrl : undefined));
              
              const progress = 'progress' in item ? item.progress : undefined;
              const completedAt = 'completedAt' in item ? item.completedAt : undefined;
              
              return (
              <div
                key={taskId}
                className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden ${
                  item.status === 'failed' ? 'border-2 border-red-300' : ''
                }`}
                title={item.status === 'failed' && item.error ? `错误: ${item.error}` : undefined}
              >
                {/* 视频预览/缩略图 */}
                <div className="relative aspect-video bg-gray-200">
                  {/* 如果视频已完成且有URL，显示视频播放器 */}
                  {item.status === 'completed' && videoUrl ? (
                    <video
                      controls
                      preload="metadata"
                      className="w-full h-full object-cover"
                      poster={inputImage}
                    >
                      <source src={videoUrl} type="video/mp4" />
                      您的浏览器不支持视频播放
                    </video>
                  ) : inputImage ? (
                    // 显示输入图片（生成中或失败时）
                    <img
                      src={inputImage}
                      alt="Input"
                      className={`w-full h-full object-cover ${
                        item.status === 'failed' ? 'opacity-60' : ''
                      }`}
                    />
                  ) : (
                    // 占位图标
                    <div className="flex items-center justify-center h-full">
                      <svg
                        className={`w-16 h-16 ${
                          item.status === 'failed' ? 'text-red-300' : 'text-gray-400'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  {/* 失败状态遮罩 */}
                  {item.status === 'failed' && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-10"></div>
                  )}
                  <div className="absolute top-2 left-2">
                    {getTypeBadge(item.type)}
                  </div>
                  {item.status === 'failed' && (
                    <div 
                      className="absolute top-2 right-2 group cursor-help"
                      title={item.error || '生成失败'}
                    >
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded flex items-center gap-1">
                        <svg 
                          className="w-3 h-3" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                        失败
                      </span>
                      {/* Tooltip on hover */}
                      {item.error && (
                        <div className="invisible group-hover:visible absolute top-full right-0 mt-1 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                          {item.error}
                        </div>
                      )}
                    </div>
                  )}
                  {/* 进行中状态标签 */}
                  {['queued', 'processing', 'active'].includes(item.status) && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded animate-pulse flex items-center gap-1">
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        生成中
                      </span>
                    </div>
                  )}
                  {/* 进度条 */}
                  {['queued', 'processing', 'active'].includes(item.status) && progress !== undefined && (
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-300 overflow-visible">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 transition-all duration-300 relative overflow-visible"
                        style={{ width: `${progress}%` }}
                      >
                        {/* 脉冲动画层 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                        
                        {/* 火花飞溅效果 - 在进度条末端 */}
                        {progress > 0 && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 -translate-x-1">
                            {/* 火花1 - 向上飞 */}
                            <div className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-spark-fly-1" style={{ left: '50%', top: '50%' }}></div>
                            {/* 火花2 - 向右上飞 */}
                            <div className="absolute w-1 h-1 bg-orange-400 rounded-full animate-spark-fly-2" style={{ left: '50%', top: '50%' }}></div>
                            {/* 火花3 - 向右飞 */}
                            <div className="absolute w-0.5 h-0.5 bg-yellow-300 rounded-full animate-spark-fly-3" style={{ left: '50%', top: '50%' }}></div>
                            {/* 火花4 - 向右下飞 */}
                            <div className="absolute w-1 h-1 bg-red-400 rounded-full animate-spark-fly-4" style={{ left: '50%', top: '50%' }}></div>
                            {/* 火花5 - 向下飞 */}
                            <div className="absolute w-0.5 h-0.5 bg-orange-300 rounded-full animate-spark-fly-5" style={{ left: '50%', top: '50%' }}></div>
                            {/* 中心亮点 */}
                            <div className="absolute w-2 h-2 bg-white rounded-full animate-spark-core" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 内容信息 */}
                <div className="p-4">
                  {/* 提示词 */}
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                    {item.prompt || '无提示词'}
                  </p>

                  {/* 参数信息 */}
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                    <span>{item.parameters.model}</span>
                    <span>•</span>
                    <span>{item.parameters.resolution}</span>
                    <span>•</span>
                    <span>{item.parameters.duration}秒</span>
                  </div>

                  {/* 时间戳 */}
                  <div className="text-xs text-gray-400 mb-3">
                    创建: {formatDate(item.createdAt)}
                    {completedAt && (
                      <div>完成: {formatDate(completedAt)}</div>
                    )}
                  </div>
                  
                  {/* 进度显示 */}
                  {['queued', 'processing'].includes(item.status) && progress !== undefined && (
                    <div className="mb-3 text-xs text-blue-600 font-medium">
                      生成进度: {progress}%
                    </div>
                  )}
                  
                  {/* 失败状态提示 */}
                  {item.status === 'failed' && item.error && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg 
                          className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-red-800 mb-1">生成失败</p>
                          <p className="text-xs text-red-700 break-words">{item.error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2">
                    {videoUrl && (
                      <a
                        href={videoUrl}
                        download
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 text-center"
                      >
                        下载视频
                      </a>
                    )}
                    {!isActive && (
                      <button
                        onClick={() => handleDelete(taskId)}
                        className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded hover:bg-red-100"
                        title="删除记录"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Video ID（用于调试） */}
                  {videoId && (
                    <div className="mt-2 text-xs text-gray-400 font-mono truncate" title={videoId}>
                      ID: {videoId}
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
