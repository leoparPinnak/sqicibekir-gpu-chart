import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    console.log('1. Setting Blur to 0px (Kristal Net - zero diffusion)...');
    await page.evaluate(() => {
        const blurSlider = document.getElementById('param-blur');
        if (blurSlider) {
            blurSlider.value = '0';
            blurSlider.dispatchEvent(new Event('input'));
        }
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/screenshot_blur_0px_crystal.png' });

    console.log('2. Setting Blur to 50px (Frosted Ice Glass - maximum diffusion)...');
    await page.evaluate(() => {
        const blurSlider = document.getElementById('param-blur');
        if (blurSlider) {
            blurSlider.value = '50';
            blurSlider.dispatchEvent(new Event('input'));
        }
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/screenshot_blur_50px_frosted.png' });

    console.log('✓ Blur comparison screenshots captured!');
    await browser.close();
})();
