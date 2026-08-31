import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

    console.log('Testing Uniswap V4 Style Market Explore Section...');
    await page.goto('http://localhost:5173/frontend/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 1. Scroll to Explore Section
    await page.evaluate(() => {
        document.getElementById('explore-section').scrollIntoView();
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'scripts/screenshot_explore_01_all.png' });
    console.log('✓ Captured Explore Section: All Markets');

    // 2. Click BIST Tab
    await page.evaluate(() => {
        window.__exploreDirector.setTab('bist');
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'scripts/screenshot_explore_02_bist.png' });
    console.log('✓ Captured Explore Section: BIST Tab');

    // 3. Click US Stocks Tab
    await page.evaluate(() => {
        window.__exploreDirector.setTab('stocks');
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'scripts/screenshot_explore_03_stocks.png' });
    console.log('✓ Captured Explore Section: US Stocks Tab');

    await browser.close();
    console.log('ALL EXPLORE TESTS COMPLETED!');
})();
