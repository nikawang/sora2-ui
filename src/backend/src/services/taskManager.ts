import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

// 任务状态类型
export type TaskStatus = 'queued' | 'active' | 'completed' | 'failed';

// 任务接口
export interface Task {
  id: string;
  type: 'text2video' | 'image2video';
  prompt?: string;
  imagePath?: string;
  parameters: {
    model: string;
    resolution: string;
    duration: number;
  };
  azureConfig: {
    endpoint: string;
    apiKey: string;
  };
  status: TaskStatus;
  progress: number;
  result?: {
    videoId: string; // OpenAI video ID
    videoUrl: string;
    videoPath: string;
  };
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * 简单的内存任务管理器
 * 替代 Redis + Bull Queue
 */
class TaskManager extends EventEmitter {
  private tasks: Map<string, Task> = new Map();
  private queue: string[] = [];
  private isProcessing = false;
  private processingTask: string | null = null;

  /**
   * 创建新任务
   */
  createTask(data: Omit<Task, 'id' | 'status' | 'progress' | 'createdAt'>): Task {
    console.log('🔍 DEBUG: createTask called, type:', data.type);
    
    const task: Task = {
      ...data,
      id: uuidv4(),
      status: 'queued',
      progress: 0,
      createdAt: new Date(),
    };
    console.log('🔍 DEBUG: task created, id:', task.id);

    this.tasks.set(task.id, task);
    console.log('🔍 DEBUG: tasks.size:', this.tasks.size);
    
    this.queue.push(task.id);
    console.log('🔍 DEBUG: queue.length:', this.queue.length);
    
    console.log(`📋 Task created: ${task.id} (${task.type})`);
    this.emit('task:created', task);
    console.log('🔍 DEBUG: task:created emitted');
    
    // 尝试处理队列
    console.log('🔍 DEBUG: calling processQueue, isProcessing:', this.isProcessing);
    this.processQueue();
    console.log('🔍 DEBUG: processQueue returned');
    
    return task;
  }

  /**
   * 获取任务
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * 更新任务进度
   */
  updateProgress(taskId: string, progress: number): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.progress = Math.min(100, Math.max(0, progress));
      this.emit('task:progress', task);
      console.log(`📊 Task ${taskId} progress: ${progress}%`);
    }
  }

  /**
   * 完成任务
   */
  completeTask(taskId: string, result: { videoId: string; videoUrl: string; videoPath: string }): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'completed';
      task.progress = 100;
      task.result = result;
      task.completedAt = new Date();
      this.emit('task:completed', task);
      console.log(`✅ Task ${taskId} completed (video ID: ${result.videoId})`);
      
      // 处理下一个任务
      this.processingTask = null;
      this.isProcessing = false;
      this.processQueue();
    }
  }

  /**
   * 任务失败
   */
  failTask(taskId: string, error: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'failed';
      task.error = error;
      task.completedAt = new Date();
      this.emit('task:failed', task);
      console.error(`❌ Task ${taskId} failed: ${error}`);
      
      // 处理下一个任务
      this.processingTask = null;
      this.isProcessing = false;
      this.processQueue();
    }
  }

  /**
   * 取消任务
   */
  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    if (task.status === 'queued') {
      // 从队列中移除
      const index = this.queue.indexOf(taskId);
      if (index > -1) {
        this.queue.splice(index, 1);
      }
      this.tasks.delete(taskId);
      console.log(`🗑️ Task ${taskId} cancelled`);
      return true;
    }

    return false;
  }

  /**
   * 删除任务（可以删除任何状态的任务）
   */
  deleteTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    // 如果任务在队列中，先移除
    const index = this.queue.indexOf(taskId);
    if (index > -1) {
      this.queue.splice(index, 1);
    }

    // 从任务列表中删除
    this.tasks.delete(taskId);
    console.log(`🗑️ Task ${taskId} deleted`);
    this.emit('task:deleted', task);
    return true;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const tasks = Array.from(this.tasks.values());
    return {
      total: tasks.length,
      queued: tasks.filter(t => t.status === 'queued').length,
      active: tasks.filter(t => t.status === 'active').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
    };
  }

  /**
   * 处理队列中的任务
   */
  private async processQueue(): Promise<void> {
    console.log('🔍 DEBUG: processQueue called, isProcessing:', this.isProcessing, 'queue.length:', this.queue.length);
    
    // 如果正在处理或队列为空，返回
    if (this.isProcessing || this.queue.length === 0) {
      console.log('🔍 DEBUG: processQueue early return - isProcessing:', this.isProcessing, 'queue empty:', this.queue.length === 0);
      return;
    }

    // 获取下一个任务
    const taskId = this.queue.shift();
    console.log('🔍 DEBUG: got taskId from queue:', taskId);
    if (!taskId) return;

    const task = this.tasks.get(taskId);
    console.log('🔍 DEBUG: got task from map:', task ? task.id : 'null');
    if (!task) return;

    // 标记为处理中
    this.isProcessing = true;
    this.processingTask = taskId;
    task.status = 'active';
    task.startedAt = new Date();
    console.log('🔍 DEBUG: about to emit task:started');
    this.emit('task:started', task);
    console.log(`🚀 Processing task: ${taskId}`);
    console.log('🔍 DEBUG: task:started emitted, listeners count:', this.listenerCount('task:started'));

    // 在这里实际处理任务会在 videoProcessor 中进行
    // taskManager 只负责队列管理
  }

  /**
   * 清理旧任务（保留最近100个）
   */
  cleanup(): void {
    const tasks = this.getAllTasks();
    const toKeep = 100;
    
    if (tasks.length > toKeep) {
      const toDelete = tasks.slice(toKeep);
      toDelete.forEach(task => {
        if (task.status === 'completed' || task.status === 'failed') {
          this.tasks.delete(task.id);
        }
      });
      console.log(`🧹 Cleaned up ${toDelete.length} old tasks`);
    }
  }
}

// 导出单例
export const taskManager = new TaskManager();

// 定期清理旧任务
setInterval(() => {
  taskManager.cleanup();
}, 60 * 60 * 1000); // 每小时清理一次
