import { useState } from 'react';
import { Settings2, Check, AlertCircle } from 'lucide-react';
import ResolutionSelector from './ResolutionSelector';
import DurationSelector from './DurationSelector';
import ModelSelector from './ModelSelector';
import ParameterPresets from './ParameterPresets';
import { validateParameters, RESOLUTION_OPTIONS } from '../../utils/videoParameters';
import type { VideoParameters } from '../../types/task';

interface ResolutionOption {
  value: string;
  label: string;
  width: number;
  height: number;
}

interface ParametersPanelProps {
  parameters: VideoParameters;
  onChange: (parameters: VideoParameters) => void;
  disabled?: boolean;
  resolutionOptions?: ResolutionOption[];
}

export default function ParametersPanel({ 
  parameters, 
  onChange, 
  disabled = false,
  resolutionOptions = RESOLUTION_OPTIONS
}: ParametersPanelProps) {
  const [showValidation, setShowValidation] = useState(false);
  
  const validation = validateParameters(parameters);

  const handleResolutionChange = (resolution: string) => {
    onChange({ ...parameters, resolution });
    setShowValidation(true);
  };

  const handleDurationChange = (duration: number) => {
    onChange({ ...parameters, duration });
    setShowValidation(true);
  };

  const handleModelChange = (model: string) => {
    onChange({ ...parameters, model });
    setShowValidation(true);
  };

  const handlePresetSelect = (presetParameters: VideoParameters) => {
    onChange(presetParameters);
    setShowValidation(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Video Parameters</h3>
        </div>
        {showValidation && (
          <div className="flex items-center gap-2">
            {validation.valid ? (
              <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <Check className="w-4 h-4" />
                Valid
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                Invalid
              </span>
            )}
          </div>
        )}
      </div>

      {/* Presets */}
      <ParameterPresets
        onSelectPreset={handlePresetSelect}
        disabled={disabled}
      />

      {/* Parameter Selectors */}
      <div className="space-y-4">
        <ResolutionSelector
          value={parameters.resolution}
          onChange={handleResolutionChange}
          disabled={disabled}
          options={resolutionOptions}
        />
        
        <DurationSelector
          value={parameters.duration}
          onChange={handleDurationChange}
          disabled={disabled}
        />
        
        <ModelSelector
          value={parameters.model}
          onChange={handleModelChange}
          disabled={disabled}
        />
      </div>

      {/* Validation Errors */}
      {showValidation && !validation.valid && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm font-medium text-destructive mb-2">
            Parameter Validation Errors:
          </p>
          <ul className="text-sm text-destructive space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Info */}
      <div className="p-3 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 These parameters will be used for video generation with Azure OpenAI Sora2
        </p>
      </div>
    </div>
  );
}
