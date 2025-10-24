import { Settings } from 'lucide-react';
import { useState } from 'react';
import ConfigModal from '../config/ConfigModal';
import ConnectionStatus from '../config/ConnectionStatus';

export default function Header() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
            <h1 className="text-xl font-bold">Sora Web UI</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <ConnectionStatus />
            
            <button
              onClick={() => setIsConfigOpen(true)}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </>
  );
}
