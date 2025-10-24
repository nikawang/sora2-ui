import { Clock } from 'lucide-react';
import { DURATION_OPTIONS } from '../../utils/videoParameters';

interface DurationSelectorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function DurationSelector({ 
  value, 
  onChange, 
  disabled = false 
}: DurationSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Clock className="w-4 h-4" />
        Duration
      </label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {DURATION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        {DURATION_OPTIONS.find(opt => opt.value === value)?.description}
      </p>
    </div>
  );
}
