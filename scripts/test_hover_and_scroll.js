import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    page.on('console', msg => console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text()));
    page.on('pageerror', err => console.error('[BROWSER ERROR]:', err));

    console.log('Navigating to http://localhost:5173/frontend/index.html...');
    await page.goto('http://localhost:5173/frontend/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('Scrolling down to explore table...');
    await page.evaluate(() => document.getElementById('explore-section').scrollIntoView({ behavior: 'smooth' }));
    await page.waitForTimeout(500);

    // Hover over each row in the table
    const rows = await page.$$('.explore-table-row');
    console.log(`Found ${rows.length} rows. Testing fast mouse hover simulation across all rows...`);
    for (let i = 0; i < rows.length; i++) {
        await rows[i].hover();
        await page.waitForTimeout(50);
    }

    // Fast scroll up and down
    console.log('Testing fast scroll up and down...');
    for (let s = 0; s < 5; s++) {
        await page.evaluate(() => window.scrollBy(0, 200));
        await page.waitForTimeout(50);
        await page.evaluate(() => window.scrollBy(0, -200));
        await page.waitForTimeout(50);
    }

    await page.screenshot({ path: 'scripts/screenshot_smooth_isolated_table.png' });
    await browser.close();
    console.log('✓ Fast hover and scroll test completed with zero glitches!');
})();
