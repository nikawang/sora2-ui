import { useConfig } from '../../hooks/useConfig';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ConnectionStatus() {
  const { config } = useConfig();

  const getStatusInfo = () => {
    if (!config) {
      return {
        icon: AlertCircle,
        text: 'Not Configured',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
      };
    }

    if (config.isConnected) {
      return {
        icon: CheckCircle,
        text: 'Connected',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      };
    }

    return {
      icon: XCircle,
      text: 'Disconnected',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    };
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  return (
    <div className={cn(
      'flex items-center gap-2 px-4 py-3 rounded-lg border',
      status.bgColor,
      status.borderColor
    )}>
      <Icon className={cn('w-5 h-5', status.color)} />
      <span className={cn('text-sm font-semibold', status.color)}>
        {status.text}
      </span>
    </div>
  );
}
