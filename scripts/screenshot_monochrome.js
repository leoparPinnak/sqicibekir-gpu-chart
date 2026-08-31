import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173/indikator_sablonu.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // 1. Full Dashboard
    await page.screenshot({ path: 'scripts/screenshot_black_theme_01_main.png' });
    console.log('✓ Main dashboard screenshot captured.');

    // 2. Open Indicators Modal
    await page.click('#btn-open-indicators');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/screenshot_black_theme_02_fx_modal.png' });
    console.log('✓ Indicators modal screenshot captured.');

    // 3. Close modal & open Script Editor
    await page.click('.fx-modal-close');
    await page.waitForTimeout(300);
    await page.click('#btn-open-script-editor');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/screenshot_black_theme_03_script_editor.png' });
    console.log('✓ Script editor screenshot captured.');

    await browser.close();
})();
