import { useState } from 'react';
import ProxyForm from '@/components/ProxyForm';
import ProxyViewer from '@/components/ProxyViewer';

export default function ProxyApp() {
  const [currentUrl, setCurrentUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleProxySubmit = async (url: string) => {
    setIsLoading(true);
    setError(undefined);
    setCurrentUrl(url);
    
    try {
      // TODO: This will be replaced with actual API call when backend is implemented
      // Simulate loading delay for demo purposes
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Loading URL through proxy:', url);
    } catch (err) {
      setError('Failed to load the website. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (currentUrl) {
      handleProxySubmit(currentUrl);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <ProxyForm 
          onSubmit={handleProxySubmit}
          isLoading={isLoading}
          error={error}
        />
        
        <ProxyViewer
          url={currentUrl}
          isLoading={isLoading}
          error={error}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}