import { chromium } from 'playwright';

async function testZoomAutoscale() {
    console.log('--- Testing Zoom In / Zoom Out Continuous Auto-Scale Lock ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    // Initial state
    const initInfo = await page.evaluate(() => ({
        viewSpan: window.viewEnd - window.viewStart,
        isAutoPriceScale: window.isAutoPriceScale
    }));
    console.log('Initial view state:', initInfo);

    // 1. Zoom in (wheel deltaY: -500)
    console.log('1. Zooming in (wheel deltaY: -500)...');
    await page.mouse.move(700, 450);
    await page.mouse.wheel(0, -500);
    await page.waitForTimeout(50); // Mid-animation frame

    const midAnimZoomIn = await page.evaluate(() => ({
        isAutoPriceScale: window.isAutoPriceScale,
        targetSpan: window.viewEnd - window.viewStart,
        smoothSpan: window.smoothViewEnd - window.smoothViewStart,
        priceMin: window.minPrice,
        priceMax: window.maxPrice
    }));
    console.log('Mid-animation Zoom In state:', midAnimZoomIn);

    await page.waitForTimeout(400); // Animation completes
    const endAnimZoomIn = await page.evaluate(() => ({
        isAutoPriceScale: window.isAutoPriceScale,
        targetSpan: window.viewEnd - window.viewStart,
        smoothSpan: window.smoothViewEnd - window.smoothViewStart,
        priceMin: window.minPrice,
        priceMax: window.maxPrice
    }));
    console.log('End-animation Zoom In state:', endAnimZoomIn);

    // 2. Zoom out (wheel deltaY: +800)
    console.log('2. Zooming out (wheel deltaY: +800)...');
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(50); // Mid-animation frame

    const midAnimZoomOut = await page.evaluate(() => ({
        isAutoPriceScale: window.isAutoPriceScale,
        targetSpan: window.viewEnd - window.viewStart,
        smoothSpan: window.smoothViewEnd - window.smoothViewStart
    }));
    console.log('Mid-animation Zoom Out state:', midAnimZoomOut);

    await page.waitForTimeout(450); // Animation completes
    const endAnimZoomOut = await page.evaluate(() => ({
        isAutoPriceScale: window.isAutoPriceScale,
        targetSpan: window.viewEnd - window.viewStart,
        smoothSpan: window.smoothViewEnd - window.smoothViewStart
    }));
    console.log('End-animation Zoom Out state:', endAnimZoomOut);

    await page.screenshot({ path: 'scripts/zoom_autoscale_screenshot.png' });
    console.log('Screenshot saved to scripts/zoom_autoscale_screenshot.png');

    await browser.close();

    if (initInfo.isAutoPriceScale === true &&
        midAnimZoomIn.isAutoPriceScale === true &&
        endAnimZoomIn.isAutoPriceScale === true &&
        midAnimZoomOut.isAutoPriceScale === true &&
        endAnimZoomOut.isAutoPriceScale === true) {
        console.log('\n--- SUCCESS: Auto-scale lock remains strictly active during and after all zoom animations! ---');
    } else {
        throw new Error('Zoom autoscale verification failed!');
    }
}

testZoomAutoscale().catch(err => {
    console.error(err);
    process.exit(1);
});
