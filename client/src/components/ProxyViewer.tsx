import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ExternalLink, AlertCircle, Globe } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProxyViewerProps {
  url?: string;
  isLoading: boolean;
  error?: string;
  onRefresh: () => void;
}

export default function ProxyViewer({ url, isLoading, error, onRefresh }: ProxyViewerProps) {
  const [contentLoading, setContentLoading] = useState(false);
  const [content, setContent] = useState<string>('');
  const [isScreenshot, setIsScreenshot] = useState(false);
  const [screenshotData, setScreenshotData] = useState<string>('');
  const [contentError, setContentError] = useState<string>('');
  const [iframeLoading, setIframeLoading] = useState(true);
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    if (url && !isLoading) {
      loadContent();
    }
  }, [url, isLoading]);

  const loadContent = async (format: 'html' | 'screenshot' = 'html') => {
    if (!url) return;
    
    setContentLoading(true);
    setContentError('');
    
    try {
      const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}&format=${format}`);
      const data = await response.json();
      
      if (data.success) {
        if (format === 'screenshot') {
          setScreenshotData(data.screenshot);
          setIsScreenshot(true);
          setContent('');
        } else {
          setContent(data.content);
          setIsScreenshot(false);
          setScreenshotData('');
        }
      } else {
        setContentError(data.error || 'Failed to load content');
      }
    } catch (err) {
      console.error('Failed to load content:', err);
      setContentError('Network error occurred');
    } finally {
      setContentLoading(false);
    }
  };

  const handleScreenshotMode = () => {
    loadContent('screenshot');
  };

  const handleHtmlMode = () => {
    loadContent('html');
  };

  const openInNewTab = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  const handleIframeError = () => {
    setIframeLoading(false);
    setContentError('Failed to load iframe content');
  };

  useEffect(() => {
    if (url && !isLoading && !error) {
      setShowIframe(true);
      setIframeLoading(true);
    } else {
      setShowIframe(false);
    }
  }, [url, isLoading, error]);

  if (!url && !isLoading) {
    return (
      <Card className="p-16 text-center bg-gradient-to-br from-card/80 to-card border-2 border-dashed border-border/50">
        <div className="space-y-6">
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-muted/50 to-muted/20 rounded-full flex items-center justify-center ring-4 ring-muted/20">
              <Globe className="h-16 w-16 text-muted-foreground/60" />
            </div>
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-2">
              <div className="w-4 h-4 bg-primary/20 rounded-full animate-ping" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">Ready to Proxy</h3>
            <p className="text-muted-foreground/80 max-w-sm mx-auto leading-relaxed">
              Enter a website URL above to load it through our secure, JavaScript-enabled proxy
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-2 pt-4">
            <div className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-bounce [animation-delay:0.1s]" />
            <div className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-bounce [animation-delay:0.2s]" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-2 border-border/50 shadow-2xl">
      <div className="border-b bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`relative w-4 h-4 rounded-full transition-all duration-500 ${
              isLoading || contentLoading 
                ? 'bg-yellow-500 animate-pulse shadow-lg shadow-yellow-500/50' 
                : error 
                ? 'bg-red-500 shadow-lg shadow-red-500/50' 
                : 'bg-green-500 shadow-lg shadow-green-500/50'
            }`}>
              <div className={`absolute inset-0 rounded-full animate-ping ${
                isLoading || contentLoading 
                  ? 'bg-yellow-400' 
                  : error 
                  ? 'bg-red-400' 
                  : 'bg-green-400'
              }`} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-mono text-sm font-medium text-foreground/90 truncate block max-w-md" title={url}>
                {url ? new URL(url).hostname : 'No URL loaded'}
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isLoading || iframeLoading ? 'Loading...' : error ? 'Connection failed' : 'Connected'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isScreenshot ? 'outline' : 'default'}
              size="sm"
              onClick={handleHtmlMode}
              disabled={contentLoading || !url}
              className="text-xs"
            >
              HTML
            </Button>
            <Button
              variant={isScreenshot ? 'default' : 'outline'}
              size="sm"
              onClick={handleScreenshotMode}
              disabled={contentLoading || !url}
              className="text-xs"
            >
              Screenshot
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading || !url}
              data-testid="button-refresh"
              className="hover:bg-card/80 transition-all duration-200 hover:scale-105"
            >
              <RefreshCw className={`h-4 w-4 transition-transform duration-200 ${isLoading ? 'animate-spin' : 'hover:rotate-180'}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
              disabled={!url}
              data-testid="button-open-external"
              className="hover:bg-card/80 transition-all duration-200 hover:scale-105"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-background/95 to-background/90" style={{ height: '700px' }}>
        {error ? (
          <div className="p-12 flex items-center justify-center h-full">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center ring-4 ring-destructive/20">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-destructive">Connection Failed</h3>
                <p className="text-muted-foreground leading-relaxed">{error}</p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={onRefresh} 
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  data-testid="button-retry"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <p className="text-xs text-muted-foreground/60">
                  Some websites may block proxy requests for security reasons
                </p>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="text-center space-y-8">
              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center ring-4 ring-primary/20 animate-pulse">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <div className="absolute top-0 right-0 w-6 h-6 bg-primary/20 rounded-full animate-ping" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">Loading Website</h3>
                <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Rendering JavaScript-heavy content through our secure proxy...
                </p>
                
                <div className="flex items-center justify-center gap-2 pt-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          </div>
        ) : showIframe && url ? (
          <>
            {iframeLoading && (
              <div className="absolute inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-10">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center ring-2 ring-primary/20 animate-pulse">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Rendering Page</p>
                    <p className="text-sm text-muted-foreground">Loading content...</p>
                  </div>
                </div>
              </div>
            )}
            <iframe
              src={`/api/proxy?url=${encodeURIComponent(url)}`}
              className="w-full h-full border-0 rounded-b-lg transition-opacity duration-500"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Proxied Website"
              data-testid="iframe-proxy-content"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
              style={{ opacity: iframeLoading ? 0.3 : 1 }}
            />
          </>
        ) : null}
      </div>
    </Card>
  );
}