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
    <Card className="p-6 w-full max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">Web Proxy</h1>
          </div>
          <p className="text-muted-foreground">
            Load JavaScript-heavy websites through our secure proxy
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="url"
              placeholder="Enter website URL (e.g., tiktok.com, youtube.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`h-12 text-lg font-mono transition-all duration-200 ${
                !urlValid ? 'border-destructive focus:ring-destructive' : 'focus:ring-primary'
              }`}
              disabled={isLoading}
              data-testid="input-proxy-url"
            />
            {url && !urlValid && (
              <p className="text-sm text-destructive">Please enter a valid URL</p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 text-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
            disabled={isLoading || !url || !urlValid}
            data-testid="button-load-proxy"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading Website...
              </>
            ) : (
              <>
                <Globe className="mr-2 h-5 w-5" />
                Load in Proxy
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <p>Supports all modern websites including TikTok, YouTube, and more</p>
        </div>
      </div>
    </Card>
  );
}