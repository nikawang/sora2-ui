import { Request, Response } from 'express';
import { taskManager } from '../services/taskManager';

export const submitTextToVideoTask = async (req: Request, res: Response) => {
  console.log('🔍 DEBUG: submitTextToVideoTask controller called');
  console.log('🔍 DEBUG: req.body:', JSON.stringify(req.body).substring(0, 200));
  try {
    const { prompt, parameters, azureConfig } = req.body;
    console.log('🔍 DEBUG: extracted prompt, parameters, and azureConfig');
    if (!prompt || !parameters) {
      console.log('🔍 DEBUG: missing fields - prompt:', !!prompt, 'parameters:', !!parameters);
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    // Use azureConfig from request body, fallback to environment variables
    const config = azureConfig || {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
      apiKey: process.env.AZURE_OPENAI_API_KEY || '',
    };
    
    console.log('🔍 DEBUG: using azureConfig -', azureConfig ? 'from request' : 'from environment');
    console.log('🔍 DEBUG: calling taskManager.createTask');
    const task = taskManager.createTask({
      type: 'text2video',
      prompt,
      parameters,
      azureConfig: config,
    });
    console.log('🔍 DEBUG: task created, sending response');
    res.json({ success: true, data: { taskId: task.id, status: task.status }, message: 'Task submitted' });
  } catch (error: any) {
    console.log('🔍 DEBUG: error in submitTextToVideoTask:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const submitImageToVideoTask = async (req: Request, res: Response) => {
  try {
    const { prompt, parameters: parametersStr, azureConfig: azureConfigStr } = req.body;
    const imageFile = req.file;
    if (!imageFile || !parametersStr) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    // Parse parameters from JSON string
    const parameters = typeof parametersStr === 'string' ? JSON.parse(parametersStr) : parametersStr;
    
    // Parse azureConfig from JSON string if present
    let azureConfig;
    if (azureConfigStr) {
      azureConfig = typeof azureConfigStr === 'string' ? JSON.parse(azureConfigStr) : azureConfigStr;
    }
    
    // Use azureConfig from request body, fallback to environment variables
    const config = azureConfig || {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
      apiKey: process.env.AZURE_OPENAI_API_KEY || '',
    };
    
    const task = taskManager.createTask({
      type: 'image2video',
      prompt: prompt || '',
      imagePath: imageFile.path,
      parameters,
      azureConfig: config,
    });
    res.json({ success: true, data: { taskId: task.id, status: task.status }, message: 'Task submitted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = taskManager.getAllTasks();
    res.json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const submitTask = async (req: Request, res: Response) => {
  try {
    const { type, prompt, imagePath, parameters, azureConfig } = req.body;
    if (!type || !parameters) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const task = taskManager.createTask({
      type,
      prompt,
      imagePath,
      parameters,
      azureConfig: azureConfig || {
        endpoint: process.env.AZURE_OPENAI_ENDPOINT ,
        apiKey: process.env.AZURE_OPENAI_API_KEY,
      },
    });
    res.json({ success: true, data: { taskId: task.id, status: task.status }, message: 'Task submitted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTaskStatus = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const task = taskManager.getTask(taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const cancelTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const cancelled = taskManager.cancelTask(taskId);
    if (!cancelled) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, message: 'Task cancelled' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const deleted = taskManager.deleteTask(taskId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = taskManager.getStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
