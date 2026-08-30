import { chromium } from 'playwright';

async function testSmoothCameraZoom() {
    console.log('--- Testing Smooth Cinematic Camera Zoom Easing ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForFunction(() => window.totalCandles > 1000 && window.minPrice > 0, { timeout: 15000 });
    await page.waitForTimeout(500);

    const canvasBox = await page.locator('#canvas-container').boundingBox();
    const cx = canvasBox.x + 700;
    const cy = canvasBox.y + 450;

    const initState = await page.evaluate(() => ({
        viewSpan: window.viewEnd - window.viewStart,
        smoothSpan: window.smoothViewEnd - window.smoothViewStart,
        minP: window.smoothMinPrice,
        maxP: window.smoothMaxPrice
    }));
    console.log('1. Initial State before Zoom:', initState);

    // 2. Trigger wheel zoom
    console.log('2. Scrolling mouse wheel to trigger camera zoom in...');
    await page.mouse.move(cx, cy);
    await page.mouse.wheel(0, -600);

    // 3. Sample frames across 250ms
    const samples = [];
    for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(30);
        const sample = await page.evaluate(() => ({
            smoothSpan: window.smoothViewEnd - window.smoothViewStart,
            minP: window.smoothMinPrice,
            maxP: window.smoothMaxPrice
        }));
        samples.push(sample);
    }

    console.log('Camera smooth zoom samples (progressive easing):', samples);

    await page.screenshot({ path: 'scripts/smooth_camera_zoom_screenshot.png' });
    console.log('Screenshot saved to scripts/smooth_camera_zoom_screenshot.png');

    await browser.close();

    // Verify samples are monotonically decreasing (smooth easing)
    let isProgressive = true;
    for (let i = 1; i < samples.length; i++) {
        if (samples[i].smoothSpan > samples[i - 1].smoothSpan) {
            isProgressive = false;
        }
    }

    if (isProgressive && samples[samples.length - 1].smoothSpan < initState.smoothSpan) {
        console.log('\n--- SUCCESS: Smooth cinematic camera zoom verified with progressive easing! ---');
    } else {
        throw new Error('Smooth camera zoom verification failed!');
    }
}

testSmoothCameraZoom().catch(err => {
    console.error(err);
    process.exit(1);
});
