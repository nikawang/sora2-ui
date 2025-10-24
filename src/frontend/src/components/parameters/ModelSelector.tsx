import { Sparkles } from 'lucide-react';
import { MODEL_OPTIONS } from '../../utils/videoParameters';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function ModelSelector({ 
  value, 
  onChange, 
  disabled = false 
}: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="w-4 h-4" />
        Model
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {MODEL_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} {option.isRecommended ? '⭐' : ''}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        {MODEL_OPTIONS.find(opt => opt.value === value)?.description}
      </p>
    </div>
  );
}
