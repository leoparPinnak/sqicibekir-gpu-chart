import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    console.log('1. Testing Frontend Portal Liquid Glass...');
    await page.goto('http://localhost:5173/frontend/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'scripts/screenshot_all_glass_01_portal.png' });
    console.log('✓ Portal screenshot captured.');

    console.log('2. Testing Terminal Dark Mode Liquid Glass...');
    await page.goto('http://localhost:5173/indikator_sablonu.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'scripts/screenshot_all_glass_02_terminal_dark.png' });
    console.log('✓ Terminal Dark screenshot captured.');

    console.log('3. Testing Terminal Light Mode Liquid Glass...');
    await page.click('#btn-theme-toggle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'scripts/screenshot_all_glass_03_terminal_light.png' });
    console.log('✓ Terminal Light screenshot captured.');

    await browser.close();
    console.log('ALL LIQUID GLASS SCREENSHOTS CAPTURED!');
})();
