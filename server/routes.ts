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
  // Iframe endpoint to serve raw HTML for iframe embedding
  app.get('/api/proxy/iframe', async (req, res) => {
    return handleIframeProxy(req, res);
  });

  // Proxy endpoint to load websites through Puppeteer
  app.get('/api/proxy', async (req, res) => {
    const format = req.query.format as string || 'html'; // 'html' or 'screenshot'
    
    if (format === 'screenshot') {
      return handleScreenshot(req, res);
    }
    
    return handleHtmlProxy(req, res);
  });
  
  // Handle iframe proxy requests - returns raw HTML
  async function handleIframeProxy(req: any, res: any) {
    try {
      const { url: rawUrl } = req.query;
      
      if (!rawUrl || typeof rawUrl !== 'string') {
        return res.status(400).send(`
          <html><body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h2>Error: URL Required</h2>
            <p>Please provide a valid URL parameter.</p>
          </body></html>
        `);
      }

      // Validate URL
      const validation = urlSchema.safeParse(rawUrl);
      if (!validation.success) {
        return res.status(400).send(`
          <html><body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h2>Error: Invalid URL</h2>
            <p>Please provide a valid URL format.</p>
          </body></html>
        `);
      }

      // Normalize URL
      const targetUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
      
      console.log(`Proxying iframe request for: ${targetUrl}`);
      
      // Initialize browser if needed
      const browserInstance = await initBrowser();
      const page = await browserInstance.newPage();
      
      try {
        // Enhanced stealth measures for iframe content
        await page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );
        
        await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
        
        await page.setExtraHTTPHeaders({
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br'
        });
        
        // Intercept and modify responses to remove iframe blocking headers
        await page.setRequestInterception(true);
        
        page.on('request', (request) => {
          request.continue();
        });
        
        page.on('response', async (response) => {
          // Log when we detect iframe-blocking headers
          const headers = response.headers();
          if (headers['x-frame-options'] || headers['content-security-policy']) {
            console.log('Detected iframe-blocking headers from:', response.url());
          }
        });
        
        // Navigate with network idle wait
        await page.goto(targetUrl, { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });
        
        // Additional wait for heavy JavaScript sites
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Try to detect if content has loaded
        try {
          await page.waitForSelector('body', { timeout: 2000 });
        } catch {
          // Continue if selector wait fails
        }
        
        // Get the fully rendered HTML
        const content = await page.content();
        
        // Set appropriate headers for iframe embedding
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Frame-Options', 'ALLOWALL');
        res.setHeader('Content-Security-Policy', 'frame-ancestors *');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        // Enhanced content cleaning for iframe compatibility
        const baseUrl = new URL(targetUrl).origin;
        
        let cleanContent = content
          // Add base tag for relative URLs
          .replace(/<head>/i, `<head><base href="${baseUrl}/">`)
          
          // Comprehensive frame-busting script removal
          .replace(/if\s*\(\s*top\s*!==\s*self\s*\)/gi, 'if(false)')
          .replace(/if\s*\(\s*self\s*!==\s*top\s*\)/gi, 'if(false)')
          .replace(/if\s*\(\s*window\s*!==\s*top\s*\)/gi, 'if(false)')
          .replace(/if\s*\(\s*top\s*!=\s*self\s*\)/gi, 'if(false)')
          .replace(/if\s*\(\s*self\s*!=\s*top\s*\)/gi, 'if(false)')
          .replace(/if\s*\(\s*window\s*!=\s*top\s*\)/gi, 'if(false)')
          .replace(/window\.top\s*!==?\s*window/gi, 'false')
          .replace(/window\s*!==?\s*window\.top/gi, 'false')
          .replace(/parent\s*!==?\s*window/gi, 'false')
          .replace(/window\s*!==?\s*parent/gi, 'false')
          .replace(/top\s*!==?\s*self/gi, 'false')
          .replace(/self\s*!==?\s*top/gi, 'false')
          
          // Remove other common frame-busting patterns
          .replace(/window\.location\s*=\s*['"]?[^'"]*['"]?/gi, '// removed redirect')
          .replace(/document\.location\s*=\s*['"]?[^'"]*['"]?/gi, '// removed redirect')
          .replace(/top\.location\s*=\s*['"]?[^'"]*['"]?/gi, '// removed redirect')
          .replace(/parent\.location\s*=\s*['"]?[^'"]*['"]?/gi, '// removed redirect')
          
          // Override frame detection variables
          .replace(/<head>/i, `<head>
            <script>
              // Override frame detection
              Object.defineProperty(window, 'top', { get: function() { return window; } });
              Object.defineProperty(window, 'parent', { get: function() { return window; } });
              Object.defineProperty(window, 'frameElement', { get: function() { return null; } });
              
              // Prevent location changes
              const originalLocation = window.location;
              Object.defineProperty(window, 'location', {
                get: function() { return originalLocation; },
                set: function(value) { console.log('Blocked redirect to:', value); }
              });
            </script>
            <meta name="viewport" content="width=device-width, initial-scale=1">`)
          
          // Remove any CSP headers from meta tags
          .replace(/<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '')
          .replace(/<meta[^>]*name=["']?Content-Security-Policy["']?[^>]*>/gi, '');
        
        // Return raw HTML for iframe display
        res.send(cleanContent);
        
      } catch (pageError) {
        console.error(`Error loading iframe page ${targetUrl}:`, pageError);
        
        // Return error HTML page
        const errorPage = `
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
                margin: 0;
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
        
        return res.status(502).send(errorPage);
      } finally {
        await page.close();
      }
      
    } catch (error) {
      console.error('Iframe proxy error:', error);
      const errorPage = `
        <html><body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h2>Server Error</h2>
          <p>Internal server error occurred while processing the request.</p>
        </body></html>
      `;
      res.status(500).send(errorPage);
    }
  }
  
  // Handle HTML proxy requests
  async function handleHtmlProxy(req: any, res: any) {
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
        // Enhanced stealth measures for better bot detection avoidance
        await page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );
        
        // Set realistic viewport
        await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
        
        // Set additional headers to appear more like a real browser
        await page.setExtraHTTPHeaders({
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br'
        });
        
        // Navigate with network idle wait (better for dynamic content)
        await page.goto(targetUrl, { 
          waitUntil: 'networkidle0', // Wait for network to be idle for 500ms
          timeout: 30000 
        });
        
        // Additional wait for heavy JavaScript sites like TikTok
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Try to detect if content has loaded by checking for common elements
        try {
          await page.waitForSelector('body', { timeout: 2000 });
        } catch {
          // If body selector fails, continue anyway
        }
        
        // Get the fully rendered HTML
        const content = await page.content();
        
        // Set appropriate headers
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Frame-Options', 'ALLOWALL');
        res.setHeader('Content-Security-Policy', 'frame-ancestors *');
        
        // Return JSON response with rendered content instead of raw HTML
        // This avoids iframe blocking issues
        const baseUrl = new URL(targetUrl).origin;
        
        // Clean up the content and inject necessary fixes
        let cleanContent = content
          // Add base tag for relative URLs
          .replace(/<head>/i, `<head><base href="${baseUrl}/">`)
          // Remove potential frame-busting scripts
          .replace(/if\s*\(\s*top\s*!==\s*self\s*\)/gi, 'if(false)')
          .replace(/window\.top\s*!==\s*window/gi, 'false')
          .replace(/parent\s*!==\s*window/gi, 'false')
          // Add responsive meta if missing
          .replace(/<head>/i, '<head><meta name="viewport" content="width=device-width, initial-scale=1">');
        
        // Return as JSON for frontend to handle
        res.json({
          success: true,
          url: targetUrl,
          content: cleanContent,
          timestamp: new Date().toISOString()
        });
        
      } catch (pageError) {
        console.error(`Error loading page ${targetUrl}:`, pageError);
        
        // Return error as JSON
        return res.status(502).json({
          success: false,
          error: 'Failed to load website',
          details: pageError instanceof Error ? pageError.message : 'Unknown error',
          url: targetUrl
        });
        
        /* Previous HTML error page for reference:
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
        */
      } finally {
        // Always close the page to free resources
        await page.close();
      }
      
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error occurred while processing the request.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Handle screenshot requests
  async function handleScreenshot(req: any, res: any) {
    try {
      const { url: rawUrl } = req.query;
      
      if (!rawUrl || typeof rawUrl !== 'string') {
        return res.status(400).json({ 
          success: false,
          error: 'URL parameter is required' 
        });
      }

      // Validate URL
      const validation = urlSchema.safeParse(rawUrl);
      if (!validation.success) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid URL format. Please provide a valid URL.' 
        });
      }

      // Normalize URL
      const targetUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
      
      console.log(`Taking screenshot for: ${targetUrl}`);
      
      // Initialize browser if needed
      const browserInstance = await initBrowser();
      const page = await browserInstance.newPage();
      
      try {
        // Enhanced stealth measures for screenshots
        await page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );
        
        await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
        
        // Set additional headers
        await page.setExtraHTTPHeaders({
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br'
        });
        
        // Navigate with network idle wait for better content loading
        await page.goto(targetUrl, { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });
        
        // Extended wait for JavaScript-heavy sites
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Ensure page content is ready
        try {
          await page.waitForSelector('body', { timeout: 2000 });
        } catch {
          // Continue if selector wait fails
        }
        
        // Take screenshot
        const screenshot = await page.screenshot({
          type: 'png',
          fullPage: false, // Just viewport
          quality: 85
        });
        
        // Return screenshot as base64 JSON response
        res.json({
          success: true,
          url: targetUrl,
          screenshot: `data:image/png;base64,${Buffer.from(screenshot).toString('base64')}`,
          timestamp: new Date().toISOString()
        });
        
      } catch (pageError) {
        console.error(`Error taking screenshot ${targetUrl}:`, pageError);
        
        res.status(502).json({
          success: false,
          error: 'Failed to take screenshot',
          details: pageError instanceof Error ? pageError.message : 'Unknown error',
          url: targetUrl
        });
      } finally {
        await page.close();
      }
      
    } catch (error) {
      console.error('Screenshot error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error occurred while taking screenshot.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

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
