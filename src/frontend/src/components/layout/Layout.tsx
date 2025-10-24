import type { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import type { PageView } from '../../App';

interface LayoutProps {
  children: ReactNode;
  currentView: PageView;
  onNavigate: (view: PageView) => void;
}

export default function Layout({ children, currentView, onNavigate }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <Sidebar currentView={currentView} onNavigate={onNavigate} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
