import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 1. Scroll down to Section 4 (Container Cards)
    console.log('Scrolling down to Section 4...');
    await page.evaluate(() => window.scrollTo(0, 1800));
    await page.waitForTimeout(500);

    // Verify floating FAB is visible in viewport
    const fab = page.locator('#floating-preview-fab');
    const isFabVisible = await fab.isVisible();
    console.log(`Is Floating Preview FAB visible after scroll: ${isFabVisible}`);
    if (!isFabVisible) {
        console.error('❌ Floating preview FAB is not visible!');
        process.exit(1);
    }

    // 2. Click Floating Preview FAB
    console.log('Clicking Floating Preview FAB to open Fullscreen Landing Preview Mode...');
    await fab.click();
    await page.waitForTimeout(600);

    // Check if overlay is active
    const overlay = page.locator('#lab-landing-preview-overlay');
    const hasActiveClass = await overlay.evaluate(el => el.classList.contains('active'));
    console.log(`Is preview overlay active: ${hasActiveClass}`);
    if (!hasActiveClass) {
        console.error('❌ Overlay does not have active class!');
        process.exit(1);
    }

    await page.screenshot({ path: 'scripts/screenshot_landing_preview_mode.png' });

    // 3. Test Exit Preview Button
    console.log('Clicking Exit Preview Button...');
    await page.click('#exit-preview-btn');
    await page.waitForTimeout(400);

    const isClosed = await overlay.evaluate(el => !el.classList.contains('active'));
    console.log(`Is preview overlay closed: ${isClosed}`);
    if (!isClosed) {
        console.error('❌ Overlay was not closed!');
        process.exit(1);
    }

    console.log('🎉 FLOATING FAB & FULLSCREEN LANDING PREVIEW MODE FULLY VERIFIED!');
    await browser.close();
})();
