import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    console.log('1. Testing Landing Page (Clean Hero Layout)...');
    await page.goto('http://localhost:5173/frontend/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'scripts/screenshot_route_01_landing.png' });
    console.log('✓ Landing page screenshot captured.');

    console.log('2. Clicking "Piyasalar" Navigation Link...');
    await page.click('a[href="./explore.html"]');
    await page.waitForURL('**/explore.html');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'scripts/screenshot_route_02_explore_page.png' });
    console.log('✓ Dedicated Explore page screenshot captured.');

    await browser.close();
    console.log('DEDICATED ROUTE TEST COMPLETED SUCCESSFULLY!');
})();
