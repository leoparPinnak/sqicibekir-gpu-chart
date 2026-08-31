import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testProductionUI() {
    console.log('--- Testing Clean Commercial Production UI ---');
    const server = http.createServer((req, res) => {
        const html = fs.readFileSync(path.resolve(__dirname, '../indikator_sablonu.html'), 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    });

    await new Promise(resolve => server.listen(5188, '127.0.0.1', resolve));

    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });

    const page = await browser.newPage({ viewport: { width: 1500, height: 920 } });
    await page.goto('http://127.0.0.1:5188');
    await page.waitForTimeout(4000);

    await page.screenshot({ path: 'scripts/clean_production_screenshot.png' });
    console.log('Clean production screenshot saved to: scripts/clean_production_screenshot.png');

    await browser.close();
    server.close();
}

testProductionUI().catch(err => {
    console.error(err);
    process.exit(1);
});
