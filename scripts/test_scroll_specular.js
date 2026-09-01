import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 950 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    console.log('1. Testing Page Scrollability...');
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(300);
    const scrollY = await page.evaluate(() => window.scrollY);
    console.log(`Page scrollY: ${scrollY}px (Expected > 0)`);

    console.log('2. Testing Sidebar Panel Scrollability...');
    await page.evaluate(() => {
        const panel = document.querySelector('.lab-controls-panel');
        if (panel) panel.scrollTop = 300;
    });
    await page.waitForTimeout(200);
    const panelScrollTop = await page.evaluate(() => {
        const panel = document.querySelector('.lab-controls-panel');
        return panel ? panel.scrollTop : 0;
    });
    console.log(`Panel scrollTop: ${panelScrollTop}px (Expected > 0)`);

    console.log('3. Adjusting Specular Brightness to 200% and Thickness to 3.5px...');
    await page.evaluate(() => {
        const spSlider = document.getElementById('param-specular');
        const widthSlider = document.getElementById('param-specular-width');
        if (spSlider) {
            spSlider.value = '200';
            spSlider.dispatchEvent(new Event('input'));
        }
        if (widthSlider) {
            widthSlider.value = '3.5';
            widthSlider.dispatchEvent(new Event('input'));
        }
    });
    await page.waitForTimeout(400);

    console.log('4. Saving thick specular preset to cookies...');
    await page.fill('#save-preset-name-input', 'Supercharged 200% Diamond 3.5px');
    await page.fill('#save-preset-desc-input', '%200 süper parlak elmas ışıltısı ve 3.5px kalın prizmatik çerçeve.');
    await page.click('#save-json-btn');
    await page.waitForTimeout(400);

    await page.screenshot({ path: 'scripts/screenshot_supercharged_specular_scroll.png' });
    console.log('✓ Captured Supercharged Specular & Scroll screenshot!');

    await browser.close();
})();
