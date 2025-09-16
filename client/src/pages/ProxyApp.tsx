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