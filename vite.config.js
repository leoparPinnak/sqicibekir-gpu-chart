import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, // '0.0.0.0' tüm ağlardan ve domainlerden erişime açar
    port: 5173,
    open: '/frontend/index.html',
    cors: true,
    // Vite Host Guvenlik Korumasini Ac / Izin Ver
    allowedHosts: [
      'tradingchart.com.tr',
      'www.tradingchart.com.tr',
      '.tradingchart.com.tr',
      'www.ottonline1553.com.tr',
      'ottonline1553.com.tr',
      '.ottonline1553.com.tr',
      'localhost',
      '127.0.0.1'
    ],
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': '*'
    },
    proxy: {
      '/ottonline-proxy': {
        target: 'https://www.ottonline1553.com.tr',
        changeOrigin: true,
        secure: false,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        rewrite: (path) => path.replace(/^\/ottonline-proxy/, '')
      }
    }
  },
  plugins: [
    {
      name: 'root-landing-router',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const rawUrl = req.url || '/';
          const [pathname, search] = rawUrl.split('?');
          if (pathname === '/' || pathname === '/index.html') {
            res.writeHead(302, {
              Location: '/frontend/index.html' + (search ? '?' + search : '')
            });
            res.end();
            return;
          }
          next();
        });
      }
    }
  ]
});
