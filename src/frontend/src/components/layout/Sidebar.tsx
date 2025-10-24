import { Video, Image, History } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { PageView } from '../../App';

type NavItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  id: PageView;
};

const navItems: NavItem[] = [
  { icon: Video, label: 'Text to Video', id: 'text2video' },
  { icon: Image, label: 'Image to Video', id: 'image2video' },
  { icon: History, label: 'History', id: 'history' },
];

interface SidebarProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
}

export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-card p-4">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
