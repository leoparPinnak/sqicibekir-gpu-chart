import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err));

    await page.goto('http://localhost:5173/indikator_sablonu.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // 1. Dark Theme Screenshot (Serbest Mode Active)
    await page.screenshot({ path: 'scripts/screenshot_tv_01_dark_serbest.png' });
    console.log('✓ Dark Theme (Serbest Mode) captured.');

    // 2. Dark Theme (Kilitli Mode Active)
    await page.click('#mode-btn-locked');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/screenshot_tv_02_dark_locked.png' });
    console.log('✓ Dark Theme (Kilitli Mode) captured.');

    // 3. Switch to Light Theme (Beyaz Tema)
    await page.click('#btn-theme-toggle');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'scripts/screenshot_tv_03_light_theme.png' });
    console.log('✓ Light Theme (TradingView White Mode) captured.');

    // 4. Light Theme in Serbest Mode
    await page.click('#mode-btn-free');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/screenshot_tv_04_light_serbest.png' });
    console.log('✓ Light Theme (Serbest Mode) captured.');

    // 5. Open Indicators Modal in Light Theme
    await page.click('#btn-open-indicators');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/screenshot_tv_05_light_fx_modal.png' });
    console.log('✓ Light Theme Indicators Modal captured.');

    await browser.close();
    console.log('ALL THEME SCREENSHOTS CAPTURED SUCCESSFULLY!');
})();
