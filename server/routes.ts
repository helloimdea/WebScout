import type { Express } from "express";
import { createServer, type Server } from "http";
import puppeteer, { type Browser } from "puppeteer";
import { z } from "zod";

let browser: Browser | null = null;

// Initialize Puppeteer browser instance
async function initBrowser() {
  if (!browser) {
    try {
      browser = await puppeteer.launch({
        headless: true,
        executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium', // Use system chromium
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-extensions',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-component-extensions-with-background-pages',
          '--disable-ipc-flooding-protection',
          '--enable-features=NetworkService,NetworkServiceLogging',
          '--single-process'
        ],
      });
      
      // Handle browser disconnection
      browser.on('disconnected', () => {
        browser = null;
        console.log('Browser disconnected, will reinitialize on next request');
      });
      
      console.log('Puppeteer browser initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Puppeteer:', error);
      // Try fallback without executablePath
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process'
          ],
        });
        console.log('Puppeteer browser initialized with fallback configuration');
      } catch (fallbackError) {
        console.error('Puppeteer fallback also failed:', fallbackError);
        throw new Error('Unable to initialize browser for proxy functionality');
      }
    }
  }
  return browser;
}

// Validate and normalize URL
const urlSchema = z.string().min(1).refine((url) => {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}, { message: "Invalid URL format" });

export async function registerRoutes(app: Express): Promise<Server> {
  // Proxy endpoint to load websites through Puppeteer
  app.get('/api/proxy', async (req, res) => {
    try {
      const { url: rawUrl } = req.query;
      
      if (!rawUrl || typeof rawUrl !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      // Validate URL
      const validation = urlSchema.safeParse(rawUrl);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid URL format. Please provide a valid URL.' 
        });
      }

      // Normalize URL (add https if missing)
      const targetUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
      
      console.log(`Proxying request for: ${targetUrl}`);
      
      // Initialize browser if needed
      const browserInstance = await initBrowser();
      const page = await browserInstance.newPage();
      
      try {
        // Set user agent to avoid bot detection
        await page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );
        
        // Set viewport for consistent rendering
        await page.setViewport({ width: 1280, height: 720 });
        
        // Navigate to the target URL with shorter timeout
        await page.goto(targetUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000 
        });
        
        // Wait briefly for JavaScript to load
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get the fully rendered HTML
        const content = await page.content();
        
        // Set appropriate headers
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Frame-Options', 'ALLOWALL');
        res.setHeader('Content-Security-Policy', 'frame-ancestors *');
        
        // Inject base tag to fix relative URLs and some basic styles
        const baseUrl = new URL(targetUrl).origin;
        const modifiedContent = content.replace(
          /<head>/i,
          `<head><base href="${baseUrl}/"><style>body{margin:0;font-family:system-ui,sans-serif;}</style>`
        );
        
        res.send(modifiedContent);
        
      } catch (pageError) {
        console.error(`Error loading page ${targetUrl}:`, pageError);
        
        // Send user-friendly error page
        const errorPage = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Proxy Error</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
                padding: 40px; 
                text-align: center; 
                background: #1a1a1a; 
                color: #fff;
              }
              .error-container { 
                max-width: 500px; 
                margin: 0 auto; 
                padding: 40px; 
                border: 1px solid #333; 
                border-radius: 8px;
              }
              .error-icon { font-size: 48px; margin-bottom: 20px; }
              h1 { color: #ef4444; margin-bottom: 16px; }
              p { color: #888; line-height: 1.6; }
              .url { 
                background: #333; 
                padding: 8px 12px; 
                border-radius: 4px; 
                font-family: monospace; 
                word-break: break-all;
                margin: 16px 0;
              }
            </style>
          </head>
          <body>
            <div class="error-container">
              <div class="error-icon">⚠️</div>
              <h1>Unable to Load Website</h1>
              <p>We couldn't load the requested website through our proxy.</p>
              <div class="url">${targetUrl}</div>
              <p><strong>Possible reasons:</strong></p>
              <ul style="text-align: left; color: #888;">
                <li>The website is blocking proxy requests</li>
                <li>The website is currently unavailable</li>
                <li>Network connectivity issues</li>
                <li>The website requires special authentication</li>
              </ul>
              <p>Try refreshing the page or entering a different URL.</p>
            </div>
          </body>
          </html>
        `;
        
        res.status(502).send(errorPage);
      } finally {
        // Always close the page to free resources
        await page.close();
      }
      
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).json({ 
        error: 'Internal server error occurred while processing the request.' 
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    try {
      const browserInstance = await initBrowser();
      const isConnected = browserInstance.isConnected();
      
      res.json({ 
        status: 'ok', 
        browser: isConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error', 
        browser: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Graceful shutdown handler
  const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...');
    if (browser) {
      await browser.close();
      browser = null;
    }
    process.exit(0);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  const httpServer = createServer(app);
  
  // Initialize browser on first request to avoid startup delays

  return httpServer;
}
