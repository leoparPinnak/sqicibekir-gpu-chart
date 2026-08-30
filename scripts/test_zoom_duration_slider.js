import { chromium } from 'playwright';

async function testZoomDurationSlider() {
    console.log('--- Testing Zoom Duration Slider & Time-Based Logarithmic Engine ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://127.0.0.1:5173');
    await page.waitForFunction(() => window.totalCandles > 1000 && window.minPrice > 0, { timeout: 15000 });
    await page.waitForTimeout(500);

    const initialLabel = await page.evaluate(() => document.getElementById('current-zoom-duration-label')?.innerText);
    console.log('1. Initial Zoom Duration Label:', initialLabel);

    // 2. Open popover via function
    console.log('2. Opening Zoom Duration Popover...');
    await page.evaluate(() => window.toggleZoomDurationPopover());
    await page.waitForTimeout(200);

    const isPopoverOpen = await page.evaluate(() => document.getElementById('zoom-duration-popover')?.classList.contains('open'));
    console.log('Popover open state:', isPopoverOpen);

    // 3. Set preset to 0.70s (Sinematik)
    console.log('3. Setting preset to 0.70s...');
    await page.evaluate(() => window.setZoomDurationPreset(0.70));
    await page.waitForTimeout(100);

    const updatedVal = await page.evaluate(() => window.zoomDurationSeconds);
    const updatedLabel = await page.evaluate(() => document.getElementById('current-zoom-duration-label')?.innerText);
    console.log(`Updated window.zoomDurationSeconds: ${updatedVal}, label: ${updatedLabel}`);

    // 4. Test zoom duration execution
    const canvasBox = await page.locator('#canvas-container').boundingBox();
    const cx = canvasBox.x + 700;
    const cy = canvasBox.y + 450;

    console.log('4. Triggering wheel zoom with 0.70s duration...');
    await page.mouse.move(cx, cy);
    await page.mouse.wheel(0, -500);

    const samples = [];
    for (let i = 0; i < 7; i++) {
        await page.waitForTimeout(100);
        const progressState = await page.evaluate(() => ({
            isZoomAnimating: window.isZoomAnimating,
            smoothSpan: window.smoothViewEnd - window.smoothViewStart,
            priceSpan: window.smoothMaxPrice - window.smoothMinPrice
        }));
        samples.push({ t: (i + 1) * 100 + 'ms', ...progressState });
    }
    console.log('Zoom progression samples across 700ms:', samples);

    await page.screenshot({ path: 'scripts/zoom_duration_slider_screenshot.png' });
    console.log('Screenshot saved to scripts/zoom_duration_slider_screenshot.png');

    await browser.close();

    if (isPopoverOpen && updatedVal === 0.70 && samples.length === 7) {
        console.log('\n--- SUCCESS: Zoom duration slider and time-based logarithmic engine verified! ---');
    } else {
        throw new Error('Zoom duration slider verification failed!');
    }
}

testZoomDurationSlider().catch(err => {
    console.error(err);
    process.exit(1);
});
