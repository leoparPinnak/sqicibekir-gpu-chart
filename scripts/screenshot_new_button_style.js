import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    console.log('Capturing updated button designs...');
    await page.goto('http://localhost:5173/frontend/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'scripts/screenshot_new_button_style.png' });
    console.log('✓ Captured screenshot: scripts/screenshot_new_button_style.png');

    await browser.close();
})();
