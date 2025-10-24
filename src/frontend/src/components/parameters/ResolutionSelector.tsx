import { Monitor } from 'lucide-react';
import { RESOLUTION_OPTIONS } from '../../utils/videoParameters';

interface ResolutionOption {
  value: string;
  label: string;
  width: number;
  height: number;
}

interface ResolutionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  options?: ResolutionOption[];
}

export default function ResolutionSelector({ 
  value, 
  onChange, 
  disabled = false,
  options = RESOLUTION_OPTIONS
}: ResolutionSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Monitor className="w-4 h-4" />
        Resolution
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        {options.find(opt => opt.value === value)?.width} × {options.find(opt => opt.value === value)?.height} pixels
      </p>
    </div>
  );
}
