import { useState } from 'react';
import { Video, Wand2, Download, Trash2, CheckCircle, XCircle, Loader } from 'lucide-react';
import ParametersPanel from '../components/parameters/ParametersPanel';
import { useVideoGeneration } from '../hooks/useVideoGeneration';
import { useTaskStore } from '../store/useTaskStore';
import { useNavigation } from '../App';
import type { VideoParameters } from '../types/task';

export default function TextToVideoPage() {
  const [prompt, setPrompt] = useState('');
  const [parameters, setParameters] = useState<VideoParameters>({
    resolution: '1280x720',
    duration: 8,
    model: 'sora-2',
  });

  const { generateTextToVideo, isSubmitting, error, hasValidConfig } = useVideoGeneration();
  const { currentTask } = useTaskStore();
  const { showSuccessToast } = useNavigation();

  const handleGenerate = async () => {
    const success = await generateTextToVideo(prompt, parameters);
    if (success) {
      showSuccessToast('视频生成任务已提交！');
    }
  };

  const charCount = prompt.length;
  const maxChars = 500;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
            <Video className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold">Text to Video</h2>
        </div>
        <p className="text-muted-foreground">
          Create videos from your text descriptions using AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Prompt Input */}
        <div className="space-y-6">
          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-4">Describe Your Video</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the video you want to create... For example: A serene sunset over the ocean with waves gently lapping at the shore"
                className="w-full min-h-[200px] px-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                maxLength={maxChars}
              />
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  Be specific and descriptive for best results
                </span>
                <span className={`${charCount > maxChars * 0.9 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                  {charCount} / {maxChars}
                </span>
              </div>
            </div>

            {/* Example Prompts */}
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium mb-2">Example Prompts:</p>
              <div className="space-y-1">
                <button
                  onClick={() => setPrompt('A majestic mountain landscape with snow-capped peaks under a clear blue sky')}
                  className="text-xs text-primary hover:underline block"
                >
                  • Mountain landscape
                </button>
                <button
                  onClick={() => setPrompt('A bustling city street at night with neon lights and people walking')}
                  className="text-xs text-primary hover:underline block"
                >
                  • City at night
                </button>
                <button
                  onClick={() => setPrompt('A peaceful forest with sunlight filtering through the trees')}
                  className="text-xs text-primary hover:underline block"
                >
                  • Forest scene
                </button>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          {prompt.trim() && (
            <div className="space-y-3">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
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
                disabled={isSubmitting || !hasValidConfig}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-semibold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
            />
          </div>
          
          {/* Task Status Display */}
          {currentTask && currentTask.type === 'text2video' && (
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
                        // Clear current task to allow new generation
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
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">提示词:</p>
                <p className="text-sm text-gray-700 line-clamp-3">{currentTask.prompt}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tips:</strong> Include details about the scene, lighting, mood, and action. 
          More specific prompts generally produce better results.
        </p>
      </div>
    </div>
  );
}
