import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

/**
 * Native Local Node.js Proxy Plugin for Vite Dev Server
 * Bypasses CORS and SSL certificate errors 100% natively using local Node.js networking.
 */
function nativeLocalProxyPlugin() {
  return {
    name: 'native-local-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/api-proxy', (req, res) => {
        try {
          const reqUrl = new URL(req.url, `http://${req.headers.host}`);
          const targetUrlStr = reqUrl.searchParams.get('url');

          if (!targetUrlStr) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing target url parameter' }));
            return;
          }

          const targetUrl = new URL(targetUrlStr);
          const isHttps = targetUrl.protocol === 'https:';
          const client = isHttps ? https : http;

          // Clone headers, stripping host/origin/referer to avoid target host mismatch
          const forwardHeaders = { ...req.headers };
          delete forwardHeaders['host'];
          delete forwardHeaders['origin'];
          delete forwardHeaders['referer'];
          forwardHeaders['host'] = targetUrl.host;

          const options = {
            hostname: targetUrl.hostname,
            port: targetUrl.port || (isHttps ? 443 : 80),
            path: targetUrl.pathname + targetUrl.search,
            method: req.method,
            headers: forwardHeaders,
            rejectUnauthorized: false, // Allows self-signed SSL certs on local dev APIs
          };

          const proxyReq = client.request(options, (proxyRes) => {
            res.statusCode = proxyRes.statusCode || 200;
            res.statusMessage = proxyRes.statusMessage || '';

            // Forward response headers with CORS headers injected
            Object.entries(proxyRes.headers).forEach(([key, val]) => {
              if (val !== undefined && key.toLowerCase() !== 'access-control-allow-origin') {
                res.setHeader(key, val);
              }
            });
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', '*');
            res.setHeader('Access-Control-Allow-Headers', '*');

            proxyRes.pipe(res);
          });

          proxyReq.on('error', (err) => {
            console.error('[Native Local Proxy Error]:', err.message);
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ error: 'Local Proxy Execution Failed', details: err.message }));
          });

          req.pipe(proxyReq);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ error: 'Local Proxy Exception', details: err.message }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nativeLocalProxyPlugin()],
});
