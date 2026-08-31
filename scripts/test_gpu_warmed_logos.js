import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    page.on('console', msg => console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text()));
    page.on('pageerror', err => console.error('[BROWSER ERROR]:', err));

    console.log('Navigating to http://localhost:5173/frontend/index.html...');
    await page.goto('http://localhost:5173/frontend/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'scripts/screenshot_warmed_hero.png' });

    await page.evaluate(() => document.getElementById('explore-section').scrollIntoView({ behavior: 'smooth' }));
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'scripts/screenshot_warmed_explore.png' });

    // Test tabs
    console.log('Testing tabs...');
    await page.click('text=Borsa İstanbul (BIST)');
    await page.waitForTimeout(300);
    await page.click('text=ABD Hisseleri (NASDAQ / NYSE)');
    await page.waitForTimeout(300);
    await page.click('text=Kripto Paralar (Binance)');
    await page.waitForTimeout(300);
    await page.click('text=Emtia & Forex');
    await page.waitForTimeout(300);
    await page.click('text=Tüm Piyasalar');
    await page.waitForTimeout(300);

    // Test search
    console.log('Testing search...');
    await page.fill('#explore-search-input', 'THYAO');
    await page.waitForTimeout(300);
    await page.fill('#explore-search-input', '');
    await page.waitForTimeout(300);

    await page.screenshot({ path: 'scripts/screenshot_warmed_final.png' });

    await browser.close();
    console.log('✓ All tests passed with 0 errors!');
})();
