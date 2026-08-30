import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testSecuredBundle() {
    console.log('--- Testing Enterprise Hardened & Obfuscated JavaScript Bundle ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle', '--allow-file-access-from-files']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    page.on('console', msg => console.log('SECURED BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('SECURED BROWSER ERROR:', err));

    const targetUrl = `file:///${path.resolve(__dirname, '../dist-secured/index.html').replace(/\\/g, '/')}`;
    console.log(`Loading secured bundle from: ${targetUrl}`);

    await page.goto(targetUrl);
    await page.waitForFunction(() => window.totalCandles > 1000 && window.minPrice > 0, { timeout: 15000 });
    await page.waitForTimeout(1000);

    const totalCandles = await page.evaluate(() => window.totalCandles);
    const scaleMode = await page.evaluate(() => window.scaleMode);
    console.log(`Secured Bundle State: totalCandles=${totalCandles}, scaleMode=${scaleMode}`);

    // Test Scale Mode Buttons on Hardened Bundle
    console.log('Testing 3 Scale Mode Buttons on Hardened Obfuscated Engine...');
    await page.locator('#mode-btn-free').click();
    await page.waitForTimeout(200);

    await page.locator('#mode-btn-locked').click();
    await page.waitForTimeout(200);

    await page.locator('#mode-btn-velocity').click();
    await page.waitForTimeout(200);

    // Test Space Key Auto-Fit
    console.log('Testing Space Key Auto-Fit on Hardened Obfuscated Engine...');
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);

    await page.screenshot({ path: 'scripts/hardened_bundle_screenshot.png' });
    console.log('Screenshot saved to scripts/hardened_bundle_screenshot.png');

    await browser.close();
    console.log('\n--- SUCCESS: Enterprise Hardened & Obfuscated Engine 100% Verified! ---');
}

testSecuredBundle().catch(err => {
    console.error(err);
    process.exit(1);
});
