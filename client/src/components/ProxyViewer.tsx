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
  const [iframeLoading, setIframeLoading] = useState(false);
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    if (url && !isLoading) {
      setIframeLoading(true);
      setShowIframe(true);
    }
  }, [url, isLoading]);

  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  const handleIframeError = () => {
    setIframeLoading(false);
  };

  const openInNewTab = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!url && !isLoading) {
    return (
      <Card className="p-12 text-center">
        <div className="space-y-4">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Globe className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Ready to Proxy</h3>
          <p className="text-muted-foreground">
            Enter a URL above to load the website through our proxy
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b bg-card-foreground/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              isLoading || iframeLoading ? 'bg-yellow-500 animate-pulse' : error ? 'bg-red-500' : 'bg-green-500'
            }`} />
            <span className="font-mono text-sm truncate max-w-md" title={url}>
              {url || 'No URL loaded'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading || !url}
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
              disabled={!url}
              data-testid="button-open-external"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative" style={{ height: '600px' }}>
        {error ? (
          <div className="p-8 flex items-center justify-center h-full">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="mt-2">
                <div className="space-y-2">
                  <p><strong>Failed to load website:</strong></p>
                  <p className="text-sm">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onRefresh} 
                    className="mt-3"
                    data-testid="button-retry"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full bg-muted/20">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div className="space-y-2">
                <p className="font-medium">Loading website...</p>
                <p className="text-sm text-muted-foreground">
                  This may take a few moments for JavaScript-heavy sites
                </p>
              </div>
            </div>
          </div>
        ) : showIframe && url ? (
          <>
            {iframeLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">Rendering page...</p>
                </div>
              </div>
            )}
            <iframe
              src={`/api/proxy?url=${encodeURIComponent(url)}`}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Proxied Website"
              data-testid="iframe-proxy-content"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </>
        ) : null}
      </div>
    </Card>
  );
}