import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const btn = await page.$('.dynamic-glass-btn.btn-lg');
    if (btn) {
        const box = await btn.boundingBox();
        if (box) {
            console.log('Testing dynamic Snell refraction beam on opposite rim...');
            // Top-left
            await page.mouse.move(box.x + box.width * 0.18, box.y + box.height * 0.25);
            await page.waitForTimeout(300);
            await page.screenshot({ path: 'scripts/screenshot_snell_refraction_top_left.png' });

            // Bottom-right
            await page.mouse.move(box.x + box.width * 0.82, box.y + box.height * 0.75);
            await page.waitForTimeout(300);
            await page.screenshot({ path: 'scripts/screenshot_snell_refraction_bottom_right.png' });
        }
    }

    console.log('✓ Dynamic Snell Refraction test completed successfully!');
    await browser.close();
})();
