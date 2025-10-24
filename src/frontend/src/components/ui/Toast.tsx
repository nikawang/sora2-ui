import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  onClick?: () => void;
  duration?: number;
}

export default function Toast({ 
  message, 
  visible, 
  onClose, 
  onClick,
  duration = 5000 
}: ToastProps) {
  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div 
      className={cn(
        "fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300",
        "bg-card border border-border rounded-lg shadow-lg p-4 min-w-[320px] max-w-md",
        onClick && "cursor-pointer hover:shadow-xl transition-shadow"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <CheckCircle className="w-5 h-5 text-green-500" />
        </div>
        <div className="flex-1 pt-0.5">
          <p className="text-sm font-medium text-foreground">
            {message}
          </p>
          {onClick && (
            <p className="text-xs text-muted-foreground mt-1">
              点击查看详情
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
