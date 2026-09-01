import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    console.log('1. Setting Inner Glow to 160% and Spread to 14px...');
    await page.evaluate(() => {
        const igSlider = document.getElementById('param-inner-glow');
        const igSpreadSlider = document.getElementById('param-inner-glow-spread');
        if (igSlider) {
            igSlider.value = '160';
            igSlider.dispatchEvent(new Event('input'));
        }
        if (igSpreadSlider) {
            igSpreadSlider.value = '14';
            igSpreadSlider.dispatchEvent(new Event('input'));
        }
    });
    await page.waitForTimeout(400);

    console.log('Taking screenshot of Supercharged Inner Glow...');
    await page.screenshot({ path: 'scripts/screenshot_supercharged_inner_glow.png' });

    console.log('✓ Visual test completed successfully!');
    await browser.close();
})();
