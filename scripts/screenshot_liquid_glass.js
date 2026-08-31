import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    await page.goto('http://localhost:5173/indikator_sablonu.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // 1. Dark Liquid Glass
    await page.screenshot({ path: 'scripts/screenshot_glass_01_dark.png' });
    console.log('✓ Dark Liquid Glass captured.');

    // 2. Open Indicators Modal in Dark Liquid Glass
    await page.click('#btn-open-indicators');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/screenshot_glass_02_dark_modal.png' });
    console.log('✓ Dark Liquid Glass Modal captured.');

    // 3. Close Modal & Switch to Light Liquid Glass
    await page.click('.fx-modal-close');
    await page.waitForTimeout(300);
    await page.click('#btn-theme-toggle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'scripts/screenshot_glass_03_light.png' });
    console.log('✓ Light Liquid Glass captured.');

    // 4. Open Indicators Modal in Light Liquid Glass
    await page.click('#btn-open-indicators');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/screenshot_glass_04_light_modal.png' });
    console.log('✓ Light Liquid Glass Modal captured.');

    await browser.close();
    console.log('ALL LIQUID GLASS SCREENSHOTS CAPTURED SUCCESSFULLY!');
})();
