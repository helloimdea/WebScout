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
      // Test the proxy endpoint to validate the URL
      const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`, {
        method: 'HEAD' // Just check if the URL is accessible
      });
      
      if (!response.ok) {
        if (response.status === 400) {
          setError('Invalid URL format. Please enter a valid website URL.');
        } else if (response.status === 502) {
          setError('Unable to load the website. It may be blocking proxy requests or currently unavailable.');
        } else {
          setError('Failed to load the website. Please try again.');
        }
        return;
      }
      
      console.log('Successfully validated URL:', url);
    } catch (err) {
      console.error('Proxy request failed:', err);
      setError('Network error. Please check your connection and try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.15),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(120,219,255,0.15),rgba(255,255,255,0))]" />
      </div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-12 space-y-12">
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
    </div>
  );
}