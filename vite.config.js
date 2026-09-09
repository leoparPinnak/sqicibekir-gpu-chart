import { defineConfig } from 'vite';
import https from 'https';
import url from 'url';

function handleYahooChartRequest(req, res) {
  const parsed = url.parse(req.url, true);
  const symbol = parsed.query.symbol;
  const interval = parsed.query.interval || '1h';
  const range = parsed.query.range || '1mo';

  if (!symbol) {
    res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ error: 'symbol query param required' }));
    return;
  }

  const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${encodeURIComponent(interval)}&range=${encodeURIComponent(range)}`;

  const reqHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
  };

  https.get(targetUrl, { headers: reqHeaders }, (upstreamRes) => {
    res.writeHead(upstreamRes.statusCode || 200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': '*'
    });
    upstreamRes.pipe(res);
  }).on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ error: err.message }));
  });
}

function handleBinanceProxyRequest(req, res) {
  const parsed = url.parse(req.url, true);
  const endpoint = req.url.replace(/^\/api\/binance/, '');
  const targetUrl = `https://api.binance.com${endpoint}`;

  const reqHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json'
  };

  https.get(targetUrl, { headers: reqHeaders }, (upstreamRes) => {
    res.writeHead(upstreamRes.statusCode || 200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': '*'
    });
    upstreamRes.pipe(res);
  }).on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ error: err.message }));
  });
}

export default defineConfig({
  server: {
    host: true, // '0.0.0.0' tüm ağlardan ve domainlerden erişime açar
    port: 5173,
    open: '/index.html',
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
      },
      '/yahoo-proxy': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        secure: false,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        rewrite: (path) => path.replace(/^\/yahoo-proxy/, '')
      }
    }
  },
  plugins: [
    {
      name: 'real-market-data-router',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const rawUrl = req.url || '/';
          const [pathname, search] = rawUrl.split('?');

          if (pathname.startsWith('/api/yahoo-chart') || pathname.startsWith('/api/yahoo')) {
            handleYahooChartRequest(req, res);
            return;
          }

          if (pathname.startsWith('/api/binance')) {
            handleBinanceProxyRequest(req, res);
            return;
          }

          // Demo redirect geçici olarak devre dışı bırakıldı - doğrudan ana terminal açılır
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          const rawUrl = req.url || '/';
          const [pathname, search] = rawUrl.split('?');

          if (pathname.startsWith('/api/yahoo-chart') || pathname.startsWith('/api/yahoo')) {
            handleYahooChartRequest(req, res);
            return;
          }

          if (pathname.startsWith('/api/binance')) {
            handleBinanceProxyRequest(req, res);
            return;
          }

          // Demo redirect geçici olarak devre dışı bırakıldı - doğrudan ana terminal açılır
          next();
        });
      }
    }
  ]
});
