import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    console.log('1. Testing Clean Demo Mode (Background Canvas Only)...');
    await page.goto('http://localhost:5173/frontend/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'scripts/screenshot_demo_clean_01.png' });
    console.log('✓ Clean Demo screenshot captured.');

    console.log('2. Testing Launch Terminal (Toolbars Restoration)...');
    await page.click('.portal-card-btn');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'scripts/screenshot_demo_clean_02_launched.png' });
    console.log('✓ Terminal Launched screenshot captured.');

    await browser.close();
    console.log('TEST COMPLETE!');
})();
