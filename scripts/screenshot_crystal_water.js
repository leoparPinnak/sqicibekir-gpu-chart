import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    console.log('Capturing crystal water refraction with candles passing behind...');
    await page.goto('http://localhost:5173/frontend/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4500);

    await page.screenshot({ path: 'scripts/screenshot_crystal_water.png' });
    console.log('✓ Captured screenshot: scripts/screenshot_crystal_water.png');

    await browser.close();
})();
