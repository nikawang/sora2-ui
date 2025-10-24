import { create } from 'zustand';
import type { VideoGenerationTask } from '../types/task';

interface TaskState {
  currentTask: VideoGenerationTask | null;
  history: VideoGenerationTask[];
  isGenerating: boolean;
  
  setCurrentTask: (task: VideoGenerationTask | null) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  updateTaskStatus: (taskId: string, status: VideoGenerationTask['status']) => void;
  completeTask: (taskId: string, videoUrl: string) => void;
  failTask: (taskId: string, error: string) => void;
  addToHistory: (task: VideoGenerationTask) => void;
  removeFromHistory: (taskId: string) => void;
  clearHistory: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  currentTask: null,
  history: [],
  isGenerating: false,
  
  setCurrentTask: (task) => 
    set({ currentTask: task, isGenerating: task !== null }),
  
  updateTaskProgress: (taskId, progress) =>
    set((state) => ({
      currentTask:
        state.currentTask?.id === taskId
          ? { ...state.currentTask, progress }
          : state.currentTask,
      history: state.history.map((task) =>
        task.id === taskId ? { ...task, progress } : task
      ),
    })),
  
  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      currentTask:
        state.currentTask?.id === taskId
          ? { ...state.currentTask, status }
          : state.currentTask,
      history: state.history.map((task) =>
        task.id === taskId ? { ...task, status } : task
      ),
    })),
  
  completeTask: (taskId, videoUrl) =>
    set((state) => {
      const completedAt = new Date().toISOString();
      const updatedTask = state.currentTask?.id === taskId
        ? {
            ...state.currentTask,
            status: 'completed' as const,
            progress: 100,
            resultVideoUrl: videoUrl,
            completedAt,
          }
        : null;
      
      return {
        currentTask: null,
        isGenerating: false,
        history: [
          ...(updatedTask ? [updatedTask] : []),
          ...state.history.map((task) =>
            task.id === taskId
              ? { ...task, status: 'completed' as const, progress: 100, resultVideoUrl: videoUrl, completedAt }
              : task
          ),
        ],
      };
    }),
  
  failTask: (taskId, error) =>
    set((state) => ({
      currentTask: null,
      isGenerating: false,
      history: state.history.map((task) =>
        task.id === taskId
          ? { ...task, status: 'failed' as const, error }
          : task
      ),
    })),
  
  addToHistory: (task) =>
    set((state) => ({
      history: [task, ...state.history].slice(0, 100), // Keep last 100
    })),
  
  removeFromHistory: (taskId) =>
    set((state) => ({
      history: state.history.filter((task) => task.id !== taskId),
      currentTask: state.currentTask?.id === taskId ? null : state.currentTask,
    })),
  
  clearHistory: () => set({ history: [] }),
}));
