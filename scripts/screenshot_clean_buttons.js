import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    await page.goto('http://localhost:5173/indikator_sablonu.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // 1. Dark Theme with Serbest active
    await page.screenshot({ path: 'scripts/screenshot_clean_01_serbest.png' });
    console.log('✓ Dark Theme Serbest captured.');

    // 2. Dark Theme with Kilitli active
    await page.click('#mode-btn-locked');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'scripts/screenshot_clean_02_locked.png' });
    console.log('✓ Dark Theme Kilitli captured.');

    // 3. Light Theme with Serbest active
    await page.click('#btn-theme-toggle');
    await page.waitForTimeout(300);
    await page.click('#mode-btn-free');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'scripts/screenshot_clean_03_light_serbest.png' });
    console.log('✓ Light Theme Serbest captured.');

    await browser.close();
    console.log('ALL CLEAN SCREENSHOTS CAPTURED!');
})();
