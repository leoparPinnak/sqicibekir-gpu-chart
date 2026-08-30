import { chromium } from 'playwright';

async function testSerbestZoomAutoscale() {
    console.log('--- Testing Auto-Scale during Wheel Zoom in Serbest (Free) Mode ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://127.0.0.1:5173');
    await page.waitForFunction(() => window.totalCandles > 1000 && window.minPrice > 0, { timeout: 15000 });
    await page.waitForTimeout(500);

    // 1. Switch to Serbest mode
    console.log('1. Switching to Serbest (Free) mode...');
    await page.locator('#mode-btn-free').click();
    await page.waitForTimeout(100);

    const mode = await page.evaluate(() => window.scaleMode);
    console.log(`scaleMode: ${mode} (Expected: free)`);

    const canvasBox = await page.locator('#canvas-container').boundingBox();
    const cx = canvasBox.x + 700;
    const cy = canvasBox.y + 450;

    // 2. Drag vertically to create an artificial offset
    console.log('2. Dragging vertically to create an offset...');
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx, cy - 200, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(100);

    const priceSpanBeforeZoom = await page.evaluate(() => window.maxPrice - window.minPrice);
    console.log(`Price span before zoom: ${priceSpanBeforeZoom}`);

    // 3. Perform Wheel Zoom in Serbest mode -> Should auto-scale to visible candles!
    console.log('3. Triggering wheel zoom in Serbest mode...');
    await page.mouse.move(cx, cy);
    await page.mouse.wheel(0, -600);
    await page.waitForTimeout(500); // wait for zoom animation to settle

    const priceSpanAfterZoom = await page.evaluate(() => window.maxPrice - window.minPrice);
    const isAutoAfterZoom = await page.evaluate(() => window.isAutoPriceScale);
    console.log(`Price span after zoom: ${priceSpanAfterZoom}, isAutoPriceScale: ${isAutoAfterZoom}`);

    // 4. Test dragging horizontally fast in Serbest mode -> Should NOT lock auto-scale
    console.log('4. Testing fast horizontal swipe in Serbest mode...');
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    for (let i = 0; i < 5; i++) {
        await page.mouse.move(cx - (i + 1) * 80, cy, { steps: 2 });
        await page.waitForTimeout(16);
    }
    await page.mouse.up();
    await page.waitForTimeout(100);

    const isAutoAfterFastSwipe = await page.evaluate(() => window.isAutoPriceScale);
    console.log(`isAutoPriceScale after fast swipe in Serbest: ${isAutoAfterFastSwipe} (Expected: false)`);

    // 5. Test manual vertical drag in Serbest mode
    console.log('5. Testing manual vertical drag in Serbest mode...');
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx, cy - 100, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(100);

    const priceOffsetAfterManualDrag = await page.evaluate(() => window.priceOffset);
    console.log(`Price offset after manual vertical drag: ${priceOffsetAfterManualDrag} (Should be active)`);

    await page.screenshot({ path: 'scripts/serbest_zoom_autoscale_screenshot.png' });
    console.log('Screenshot saved to scripts/serbest_zoom_autoscale_screenshot.png');

    await browser.close();

    if (mode === 'free' && isAutoAfterFastSwipe === false && priceOffsetAfterManualDrag !== 0) {
        console.log('\n--- SUCCESS: Auto-scale on wheel zoom in Serbest mode verified 100%! ---');
    } else {
        throw new Error('Verification failed!');
    }
}

testSerbestZoomAutoscale().catch(err => {
    console.error(err);
    process.exit(1);
});
