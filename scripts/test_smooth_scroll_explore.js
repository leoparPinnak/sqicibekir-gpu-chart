import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    console.log('1. Loading Homepage...');
    await page.goto('http://localhost:5173/frontend/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    console.log('2. Clicking "Piyasalar" (Testing Smooth Scroll Down to Table)...');
    await page.click('a[href="#explore-section"]');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'scripts/screenshot_single_page_explore.png' });
    console.log('✓ Captured single-page explore section screenshot.');

    await browser.close();
    console.log('SINGLE PAGE TEST COMPLETED!');
})();
