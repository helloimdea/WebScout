import { useState } from 'react';
import ProxyViewer from '../ProxyViewer';
import { Button } from '@/components/ui/button';

export default function ProxyViewerExample() {
  const [state, setState] = useState<'empty' | 'loading' | 'loaded' | 'error'>('empty');
  const [url, setUrl] = useState('');

  const simulateStates = () => {
    switch (state) {
      case 'empty':
        setState('loading');
        setUrl('https://tiktok.com');
        setTimeout(() => setState('loaded'), 2000);
        break;
      case 'loaded':
        setState('error');
        break;
      case 'error':
        setState('empty');
        setUrl('');
        break;
      default:
        setState('empty');
        setUrl('');
    }
  };

  const handleRefresh = () => {
    console.log('Refresh clicked for URL:', url);
    if (state === 'error') {
      setState('loading');
      setTimeout(() => setState('loaded'), 1500);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Proxy Viewer States</h3>
        <Button onClick={simulateStates} variant="outline">
          Next State: {state === 'empty' ? 'loading' : state === 'loading' ? 'loaded' : state === 'loaded' ? 'error' : 'empty'}
        </Button>
      </div>
      
      <ProxyViewer
        url={url || undefined}
        isLoading={state === 'loading'}
        error={state === 'error' ? 'Failed to connect to the target website. The site may be blocking proxy requests or experiencing connectivity issues.' : undefined}
        onRefresh={handleRefresh}
      />
    </div>
  );
}