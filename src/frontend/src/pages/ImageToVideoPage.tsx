import { useState } from 'react';
import { Image, Wand2, Download, Trash2, CheckCircle, XCircle, Loader } from 'lucide-react';
import FileUpload from '../components/upload/FileUpload';
import ParametersPanel from '../components/parameters/ParametersPanel';
import { useFileUpload } from '../hooks/useFileUpload';
import { useVideoGeneration } from '../hooks/useVideoGeneration';
import { useTaskStore } from '../store/useTaskStore';
import { useNavigation } from '../App';
import type { VideoParameters } from '../types/task';

export default function ImageToVideoPage() {
  const { uploadFile, uploading, error: uploadError } = useFileUpload();
  const { generateImageToVideo, isSubmitting, error: generationError, hasValidConfig } = useVideoGeneration();
  const { currentTask } = useTaskStore();
  const { showSuccessToast } = useNavigation();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [prompt, setPrompt] = useState('');
  
  // Image to Video 使用不同的默认分辨率
  const [parameters, setParameters] = useState<VideoParameters>({
    resolution: '1280x720', // Image to Video 支持的分辨率
    duration: 8,
    model: 'sora-2',
  });

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    const result = await uploadFile(file);
    if (result) {
      setUploadResult(result);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setUploadResult(null);
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      alert('Please upload an image first');
      return;
    }
    
    const success = await generateImageToVideo(selectedFile, prompt, parameters);
    if (success) {
      showSuccessToast('视频生成任务已提交！');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Image className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold">Image to Video</h2>
        </div>
        <p className="text-muted-foreground">
          Transform your images into engaging videos using AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - File Upload */}
        <div className="space-y-6">
          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-4">Upload Image</h3>
            <FileUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              selectedFile={selectedFile}
            />
            {uploadError && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{uploadError}</p>
              </div>
            )}
            {uploadResult && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ Image uploaded successfully: {uploadResult.filename}
                </p>
              </div>
            )}
          </div>

          {/* Prompt Input */}
          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-4">Describe the Motion (Optional)</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what motion or transformation you want... (e.g., 'camera slowly zooms in', 'leaves gently blowing in the wind')"
              className="w-full min-h-[120px] p-4 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Adding a prompt can help guide the video generation. Leave blank to let AI decide the motion. 
            </p>
          </div>

          {/* Generate Button */}
          {uploadResult && (
            <div className="space-y-3">
              {generationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{generationError}</p>
                </div>
              )}
              
              {!hasValidConfig && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-600">
                    Please configure Azure OpenAI connection in Settings first
                  </p>
                </div>
              )}
              
              <button
                onClick={handleGenerate}
                disabled={uploading || isSubmitting || !hasValidConfig}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-5 h-5" />
                {isSubmitting ? 'Submitting...' : 'Generate Video'}
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Parameters & Status */}
        <div className="space-y-6">
          <div className="p-6 border border-border rounded-lg bg-card">
            <ParametersPanel
              parameters={parameters}
              onChange={setParameters}
              disabled={uploading}
            />
          </div>
          
          {/* Task Status Display */}
          {currentTask && currentTask.type === 'image2video' && (
            <div className="p-6 border border-border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-4">生成状态</h3>
              
              {/* Status Badge */}
              <div className="mb-4">
                {currentTask.status === 'queued' && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span className="font-medium">排队中...</span>
                  </div>
                )}
                {currentTask.status === 'processing' && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span className="font-medium">生成中...</span>
                  </div>
                )}
                {currentTask.status === 'completed' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">生成完成</span>
                  </div>
                )}
                {currentTask.status === 'failed' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">生成失败</span>
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              {['queued', 'processing'].includes(currentTask.status) && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">进度</span>
                    <span className="font-medium">{currentTask.progress || 0}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                      style={{ width: `${currentTask.progress || 0}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Error Message */}
              {currentTask.status === 'failed' && currentTask.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{currentTask.error}</p>
                </div>
              )}
              
              {/* Video Player */}
              {currentTask.status === 'completed' && currentTask.resultVideoUrl && (
                <div className="space-y-3">
                  <video
                    src={currentTask.resultVideoUrl}
                    controls
                    className="w-full rounded-lg"
                  />
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <a
                      href={currentTask.resultVideoUrl}
                      download
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      下载视频
                    </a>
                    <button
                      onClick={() => {
                        window.location.reload();
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                      title="清除并生成新视频"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Prompt Info */}
              {currentTask.prompt && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">提示词:</p>
                  <p className="text-sm text-gray-700 line-clamp-3">{currentTask.prompt}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tips:</strong> For best results, use clear, well-lit images with 
          the main subject in focus. Supported formats: JPG, PNG, GIF (max 10MB).
        </p>
      </div>
    </div>
  );
}
