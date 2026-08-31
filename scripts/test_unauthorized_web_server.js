import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testUnauthorizedWebServer() {
    console.log('🏴‍☠️ [PIRATE SERVER TEST] Attacker hosts your stolen file on: http://127.0.0.1:9999');

    // 1. Pirate server on port 9999
    const pirateServer = http.createServer((req, res) => {
        const html = fs.readFileSync(path.resolve(__dirname, '../dist-secured/strictly_locked_demo.html'), 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    });

    await new Promise(resolve => pirateServer.listen(9999, '127.0.0.1', resolve));
    console.log('Pirate web server is LIVE on http://127.0.0.1:9999');

    const browser = await chromium.launch({
        headless: false, // Visible on user screen!
        slowMo: 600
    });

    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    console.log('\nNavigating to pirate site http://127.0.0.1:9999...');
    await page.goto('http://127.0.0.1:9999');
    await page.waitForTimeout(2000);

    const finalUrl = page.url();
    const hasCanvas = await page.evaluate(() => !!document.querySelector('#chart-canvas'));

    console.log(`\nFinal Page URL: ${finalUrl}`);
    console.log(`Did the engine render on the pirate site? ${hasCanvas ? 'YES' : 'NO'}`);

    if (finalUrl === 'about:blank' || !hasCanvas) {
        console.log('\n🛑 SONUÇ: Domain Kilidi başarıyla devreye girdi! Dosya çalınıp başka bir web sitesinde (127.0.0.1:9999) yayınlandığı için sayfa kendini ANINDA KAPATTI ve beyaz ekran verdi!');
    }

    await page.waitForTimeout(3000);
    await browser.close();
    pirateServer.close();
}

testUnauthorizedWebServer().catch(err => {
    console.error(err);
    process.exit(1);
});
