import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Globe, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProxyFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  error?: string;
}

export default function ProxyForm({ onSubmit, isLoading, error }: ProxyFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    // Basic URL validation
    let formattedUrl = url.trim();
    if (!formattedUrl.match(/^https?:\/\//)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    onSubmit(formattedUrl);
  };

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
      return true;
    } catch {
      return false;
    }
  };

  const urlValid = !url || isValidUrl(url);

  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-xl blur-3xl opacity-50" />
      
      <Card className="relative p-8 w-full max-w-5xl mx-auto backdrop-blur-sm border-2 border-border/50 shadow-2xl">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-full ring-2 ring-primary/20">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Web Proxy
                </h1>
                <p className="text-sm text-muted-foreground mt-1 tracking-wide">
                  POWERED BY PUPPETEER
                </p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Load JavaScript-heavy websites like TikTok, YouTube, and more through our secure, high-performance proxy
            </p>
          </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <div className="relative">
              <Input
                type="url"
                placeholder="Enter website URL (e.g., tiktok.com, youtube.com, twitter.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={`h-16 text-lg font-mono pl-6 pr-6 bg-card/50 backdrop-blur-sm border-2 rounded-xl transition-all duration-300 placeholder:text-muted-foreground/60 ${
                  !urlValid 
                    ? 'border-destructive/50 focus:ring-destructive/20 focus:border-destructive' 
                    : 'border-border/50 focus:ring-primary/20 focus:border-primary hover:border-primary/60'
                }`}
                disabled={isLoading}
                data-testid="input-proxy-url"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Globe className={`h-5 w-5 transition-colors ${
                  urlValid && url ? 'text-primary' : 'text-muted-foreground/40'
                }`} />
              </div>
            </div>
            {url && !urlValid && (
              <div className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <span>Please enter a valid URL</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-16 text-xl font-bold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] disabled:hover:scale-100 rounded-xl"
            disabled={isLoading || !url || !urlValid}
            data-testid="button-load-proxy"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                <span>Loading Website...</span>
              </>
            ) : (
              <>
                <Globe className="mr-3 h-6 w-6" />
                <span>Load in Proxy</span>
              </>
            )}
          </Button>
        </form>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Real-time rendering</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>JavaScript execution</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span>Secure proxy</span>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground/70 max-w-md mx-auto">
            Supports all modern websites including social media, streaming platforms, and dynamic web applications
          </p>
        </div>
      </div>
    </Card>
    </div>
  );
}