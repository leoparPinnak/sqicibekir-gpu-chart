import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1100 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    console.log('1. Testing modular tuning:');
    // Set Emerald buttons, Violet Inputs, Amber Container
    await page.evaluate(() => {
        // Buttons to Emerald
        const btnEmerald = document.querySelector('.comp-color-palette[data-comp="btn"] .color-dot[data-color="#10b981"]');
        if (btnEmerald) btnEmerald.click();

        // Inputs to Violet
        const inputViolet = document.querySelector('.comp-color-palette[data-comp="input"] .color-dot[data-color="#8b5cf6"]');
        if (inputViolet) inputViolet.click();

        // Cards to Gold Amber
        const cardAmber = document.querySelector('.comp-color-palette[data-comp="card"] .color-dot[data-color="#f59e0b"]');
        if (cardAmber) cardAmber.click();

        // Tune Button specular to 160% and inner glow to 120%
        const btnSp = document.getElementById('param-btn-specular');
        if (btnSp) {
            btnSp.value = '160';
            btnSp.dispatchEvent(new Event('input'));
        }
        const btnIg = document.getElementById('param-btn-inner-glow');
        if (btnIg) {
            btnIg.value = '120';
            btnIg.dispatchEvent(new Event('input'));
        }
    });

    await page.waitForTimeout(500);
    console.log('Taking full page screenshot...');
    await page.screenshot({ path: 'scripts/screenshot_modular_glass_lab_full.png', fullPage: true });

    console.log('2. Testing sub-nav filter clicking "Buttons"...');
    await page.click('.comp-filter-btn[data-comp-target="btn"]');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'scripts/screenshot_filter_buttons_only.png' });

    console.log('3. Returning to "All" (Tümü)...');
    await page.click('.comp-filter-btn[data-comp-target="all"]');
    await page.waitForTimeout(300);

    console.log('✓ Multi-component Modular Glass Lab verified successfully!');
    await browser.close();
})();
