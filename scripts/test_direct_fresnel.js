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
            console.log('Hovering over Google button at left edge...');
            await page.mouse.move(box.x + 30, box.y + box.height / 2);
            await page.waitForTimeout(300);
            await page.screenshot({ path: 'scripts/screenshot_direct_fresnel_left.png' });

            console.log('Hovering over Google button at right pill curve...');
            await page.mouse.move(box.x + box.width - 30, box.y + box.height / 2);
            await page.waitForTimeout(300);
            await page.screenshot({ path: 'scripts/screenshot_direct_fresnel_right.png' });
        }
    }

    console.log('✓ Direct Fresnel border tracking verified!');
    await browser.close();
})();
