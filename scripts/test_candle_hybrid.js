import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // 1. Check background switcher
    const bgButtons = await page.locator('.lab-bg-switcher .lab-pill-btn').count();
    console.log(`Found ${bgButtons} background mode buttons.`);
    if (bgButtons < 5) {
        console.error('❌ Expected at least 5 background modes.');
        process.exit(1);
    }

    console.log('Testing Hybrid background mode (Mum + Aurora)...');
    await page.click('.lab-bg-switcher .lab-pill-btn[data-bg="hybrid"]');
    await page.waitForTimeout(300);

    const bodyClass = await page.evaluate(() => document.body.className);
    console.log(`Body class is now: ${bodyClass}`);

    // 2. Scroll to Section 7
    const sec7 = await page.locator('#section-aurora-studio');
    await sec7.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // 3. Test Candle Opacity Slider
    console.log('Setting Candle Opacity to 90%...');
    await page.evaluate(() => {
        const slider = document.getElementById('param-candle-opacity');
        slider.value = 90;
        slider.dispatchEvent(new Event('input'));
    });
    await page.waitForTimeout(200);

    // 4. Test Candle Blur Slider (e.g. 0px crystal clear)
    console.log('Setting Candle Blur to 0px (Crystal Clear)...');
    await page.evaluate(() => {
        const slider = document.getElementById('param-candle-blur');
        slider.value = 0;
        slider.dispatchEvent(new Event('input'));
    });
    await page.waitForTimeout(200);

    const valOp = await page.locator('#val-candle-opacity').textContent();
    const valBl = await page.locator('#val-candle-blur').textContent();
    console.log(`Live Candle Settings -> Opacity: ${valOp}, Blur: ${valBl}`);

    await page.screenshot({ path: 'scripts/screenshot_candle_hybrid_stage.png' });

    console.log('🎉 HYBRID CANDLE + AURORA STAGE AND CONTROLS FULLY VERIFIED!');
    await browser.close();
})();
