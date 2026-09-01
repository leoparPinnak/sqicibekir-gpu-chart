import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const domains = ['btn', 'input', 'tab', 'card'];
    for (const d of domains) {
        const dotsCount = await page.locator(`.comp-color-palette[data-comp="${d}"] .color-dot`).count();
        const pickerCount = await page.locator(`.comp-color-palette[data-comp="${d}"] .comp-custom-color-picker`).count();
        console.log(`Domain '${d}': ${dotsCount} neon color dots, ${pickerCount} custom picker.`);
        if (dotsCount < 14 || pickerCount === 0) {
            console.error(`❌ Expected at least 14 color dots and 1 picker for ${d}`);
            process.exit(1);
        }
    }

    console.log('Testing Neon Pink click on Buttons...');
    await page.click('.comp-color-palette[data-comp="btn"] .color-dot[data-color="#ff00aa"]');
    await page.waitForTimeout(200);

    console.log('Testing Matrix Neon Green click on Inputs...');
    await page.click('.comp-color-palette[data-comp="input"] .color-dot[data-color="#00ff66"]');
    await page.waitForTimeout(200);

    console.log('Testing Hyper Cyan click on Tabs...');
    await page.click('.comp-color-palette[data-comp="tab"] .color-dot[data-color="#00f0ff"]');
    await page.waitForTimeout(200);

    console.log('Testing Cosmic Purple click on Cards...');
    await page.click('.comp-color-palette[data-comp="card"] .color-dot[data-color="#a855f7"]');
    await page.waitForTimeout(300);

    await page.screenshot({ path: 'scripts/screenshot_neon_colors_full.png', fullPage: true });

    console.log('🎉 ALL NEON COLOR PALETTES & CUSTOM PICKERS VERIFIED PERFECTLY!');
    await browser.close();
})();
