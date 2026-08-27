import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, // '0.0.0.0' tüm ağlardan ve domainlerden erişime açar
    port: 5173,
    open: true,
    cors: true,
    // Vite Host Güvenlik Korumasını Aç / İzin Ver
    allowedHosts: [
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
  }
});
