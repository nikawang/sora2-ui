import { useState, createContext, useContext } from 'react';
import Layout from './components/layout/Layout';
import TextToVideoPage from './pages/TextToVideoPage';
import ImageToVideoPage from './pages/ImageToVideoPage';
import { HistoryPage } from './pages/HistoryPage';
import Toast from './components/ui/Toast';

export type PageView = 'home' | 'text2video' | 'image2video' | 'history' | 'settings';

// 创建导航 Context
interface NavigationContextType {
  navigateTo: (view: PageView) => void;
  showSuccessToast: (message: string) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationContext');
  }
  return context;
};

function App() {
  const [currentView, setCurrentView] = useState<PageView>('home');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const navigateTo = (view: PageView) => {
    setCurrentView(view);
  };

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'text2video':
        return <TextToVideoPage />;
      case 'image2video':
        return <ImageToVideoPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Settings</h2>
            <p className="text-muted-foreground">Use the settings icon in the header to configure Azure OpenAI</p>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome to Sora Web UI</h2>
              <p className="text-muted-foreground">
                Generate amazing videos using Azure OpenAI Sora2 model
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setCurrentView('text2video')}
                className="p-6 border border-border rounded-lg bg-card hover:bg-accent hover:border-primary transition-all text-left group"
              >
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  Text to Video
                </h3>
                <p className="text-muted-foreground">
                  Create videos from text descriptions
                </p>
              </button>
              
              <button
                onClick={() => setCurrentView('image2video')}
                className="p-6 border border-border rounded-lg bg-card hover:bg-accent hover:border-primary transition-all text-left group"
              >
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  Image to Video
                </h3>
                <p className="text-muted-foreground">
                  Transform images into engaging videos
                </p>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <NavigationContext.Provider value={{ navigateTo, showSuccessToast }}>
      <Layout currentView={currentView} onNavigate={setCurrentView}>
        {renderContent()}
      </Layout>
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
        onClick={() => {
          setToastVisible(false);
          setCurrentView('history');
        }}
      />
    </NavigationContext.Provider>
  );
}

export default App
