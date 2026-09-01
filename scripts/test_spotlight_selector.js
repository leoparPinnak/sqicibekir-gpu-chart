import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    console.log('1. Moving mouse over Google Button to trigger dynamic spotlight flare...');
    const btn = await page.$('.dynamic-glass-btn.btn-lg');
    if (btn) {
        const box = await btn.boundingBox();
        if (box) {
            // Hover near the left-center of the button
            await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.5);
            await page.waitForTimeout(300);
        }
    }

    console.log('2. Testing Quick Preset Select Dropdown...');
    const selectOptionsCount = await page.evaluate(() => {
        const sel = document.getElementById('quick-preset-select');
        return sel ? sel.options.length : 0;
    });
    console.log(`Quick Preset Select Options Count: ${selectOptionsCount}`);

    console.log('3. Selecting a preset from the dropdown...');
    if (selectOptionsCount > 1) {
        await page.selectOption('#quick-preset-select', '0');
        await page.waitForTimeout(400);
    }

    console.log('Taking screenshot of Spotlight Torch Flare and Quick Preset Selector...');
    await page.screenshot({ path: 'scripts/screenshot_spotlight_flare_and_selector.png' });

    console.log('✓ Visual test completed successfully!');
    await browser.close();
})();
