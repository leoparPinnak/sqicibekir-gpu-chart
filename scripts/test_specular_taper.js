import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    console.log('Taking screenshot of smooth specular highlight buttons and inputs...');
    await page.screenshot({ path: 'scripts/screenshot_smooth_specular_taper.png' });

    console.log('Hovering over Google button to capture dynamic highlight flare...');
    await page.hover('.dynamic-glass-btn.btn-lg');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'scripts/screenshot_smooth_specular_hover.png' });

    console.log('✓ Smooth Specular Taper visual tests complete!');
    await browser.close();
})();
