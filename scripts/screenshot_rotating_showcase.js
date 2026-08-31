import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    console.log('Testing Rotating Asset Showcase with Brand Logos...');
    await page.goto('http://localhost:5173/frontend/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 1. Initial Asset (BTC)
    await page.screenshot({ path: 'scripts/screenshot_showcase_01_btc.png' });
    console.log('✓ Captured Asset 1: BTC');

    // 2. Next Asset (THYAO)
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'scripts/screenshot_showcase_02_thy.png' });
    console.log('✓ Captured Asset 2: THYAO');

    // 3. Next Asset (NVDA)
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'scripts/screenshot_showcase_03_nvda.png' });
    console.log('✓ Captured Asset 3: NVDA');

    await browser.close();
    console.log('ALL SHOWCASE SCREENSHOTS CAPTURED!');
})();
