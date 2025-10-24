import { Zap } from 'lucide-react';
import { PARAMETER_PRESETS, type ParameterPreset } from '../../utils/videoParameters';
import type { VideoParameters } from '../../types/task';

interface ParameterPresetsProps {
  onSelectPreset: (parameters: VideoParameters) => void;
  disabled?: boolean;
}

export default function ParameterPresets({ 
  onSelectPreset, 
  disabled = false 
}: ParameterPresetsProps) {
  const handlePresetClick = (preset: ParameterPreset) => {
    onSelectPreset(preset.parameters);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4" />
        <h4 className="text-sm font-medium">Quick Presets</h4>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {PARAMETER_PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handlePresetClick(preset)}
            disabled={disabled}
            className="p-3 border border-border rounded-lg hover:bg-accent hover:border-primary transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{preset.icon}</span>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                Quick apply
              </span>
            </div>
            <h5 className="text-sm font-semibold mb-1">{preset.name}</h5>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {preset.description}
            </p>
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 bg-muted rounded">
                  {preset.parameters.resolution}
                </span>
                <span className="px-2 py-0.5 bg-muted rounded">
                  {preset.parameters.duration}s
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
