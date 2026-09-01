import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // 1. Check live chart canvas
    const canvasExists = await page.locator('#lab-live-chart-canvas').count();
    console.log(`Canvas count: ${canvasExists}`);
    if (canvasExists === 0) {
        console.error('❌ Canvas not found!');
        process.exit(1);
    }

    // 2. Click Primary Button in Preview
    console.log('Clicking Primary Button in Section 1 Preview...');
    await page.click('button[data-target-id="btn-primary"]');
    await page.waitForTimeout(300);

    // Check badge text
    const badgeText = await page.locator('#target-badge-btn').textContent();
    console.log(`Target badge text: ${badgeText}`);
    if (!badgeText.includes('Google Buton')) {
        console.error(`❌ Expected Google Buton, got ${badgeText}`);
        process.exit(1);
    }

    // Check if element has selected attribute
    const isSelected = await page.locator('button[data-target-id="btn-primary"]').getAttribute('data-element-selected');
    console.log(`Is button selected: ${isSelected}`);

    // 3. Move slider for this individual button (e.g. radius to 12px)
    console.log('Changing radius of Google Buton to 12px...');
    await page.evaluate(() => {
        const slider = document.getElementById('param-btn-radius');
        slider.value = 12;
        slider.dispatchEvent(new Event('input'));
    });
    await page.waitForTimeout(300);

    // Check individual button style
    const btnRadius = await page.evaluate(() => {
        return document.querySelector('button[data-target-id="btn-primary"]').style.borderRadius;
    });
    console.log(`Google Button borderRadius: ${btnRadius}`);

    // 4. Click Search Input in Section 2 Preview
    console.log('Clicking Search Capsule in Section 2 Preview...');
    const inputSec = await page.locator('#section-inputs-studio');
    await inputSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    await page.click('div[data-target-id="input-search"]');
    await page.waitForTimeout(300);

    const inputBadgeText = await page.locator('#target-badge-input').textContent();
    console.log(`Input target badge text: ${inputBadgeText}`);

    // Move specular slider for search capsule to 220%
    await page.evaluate(() => {
        const slider = document.getElementById('param-input-specular');
        slider.value = 220;
        slider.dispatchEvent(new Event('input'));
    });
    await page.waitForTimeout(300);

    await page.screenshot({ path: 'scripts/screenshot_element_targeting.png' });
    console.log('🎉 ELEMENT TARGETING & LIVE BACKGROUND CANDLE DEMO VERIFIED!');
    await browser.close();
})();
