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
            console.log('1. Moving cursor to the LEFT-TOP corner of the button to see light refract on OPPOSITE RIGHT-BOTTOM rim...');
            await page.mouse.move(box.x + box.width * 0.15, box.y + box.height * 0.2);
            await page.waitForTimeout(300);
            await page.screenshot({ path: 'scripts/screenshot_opposing_rim_caustic_left.png' });

            console.log('2. Moving cursor to the RIGHT-BOTTOM of the button to see light refract on OPPOSITE LEFT-TOP rim...');
            await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.8);
            await page.waitForTimeout(300);
            await page.screenshot({ path: 'scripts/screenshot_opposing_rim_caustic_right.png' });
        }
    }

    console.log('✓ Opposing rim caustic tests completed!');
    await browser.close();
})();
