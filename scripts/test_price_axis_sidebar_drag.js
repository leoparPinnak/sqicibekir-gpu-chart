import { chromium } from 'playwright';

async function testPriceAxisSidebarDrag() {
    console.log('--- Testing Right Price Axis Sidebar Manual Drag Scaling & Double Click Reset ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForFunction(() => window.totalCandles > 1000 && window.minPrice > 0, { timeout: 15000 });
    await page.waitForTimeout(500);

    const priceAxisBox = await page.locator('#price-axis').boundingBox();
    if (!priceAxisBox) throw new Error('Price axis sidebar not found');

    const ax = priceAxisBox.x + (priceAxisBox.width / 2);
    const ay = priceAxisBox.y + (priceAxisBox.height / 2);

    const initSpan = await page.evaluate(() => window.maxPrice - window.minPrice);
    console.log('1. Initial price span:', initSpan);

    // 1. Drag down on price axis (zoom out vertically)
    console.log('2. Dragging down on price axis...');
    await page.mouse.move(ax, ay);
    await page.mouse.down();
    for (let i = 1; i <= 6; i++) {
        await page.mouse.move(ax, ay + (i * 20));
        await page.waitForTimeout(20);
    }
    await page.mouse.up();

    const spanAfterDragDown = await page.evaluate(() => ({
        span: window.maxPrice - window.minPrice,
        isAutoPriceScale: window.isAutoPriceScale,
        badgeText: document.getElementById('scale-status-text')?.innerText
    }));
    console.log('State after dragging down on price axis:', spanAfterDragDown);

    // 2. Drag up on price axis (zoom in vertically)
    console.log('3. Dragging up on price axis...');
    await page.mouse.move(ax, ay);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) {
        await page.mouse.move(ax, ay - (i * 20));
        await page.waitForTimeout(20);
    }
    await page.mouse.up();

    const spanAfterDragUp = await page.evaluate(() => ({
        span: window.maxPrice - window.minPrice,
        isAutoPriceScale: window.isAutoPriceScale
    }));
    console.log('State after dragging up on price axis:', spanAfterDragUp);

    // 3. Double click on price axis to reset scale
    console.log('4. Double clicking price axis to reset auto scale...');
    await page.locator('#price-axis').dblclick();
    await page.waitForTimeout(200);

    const stateAfterReset = await page.evaluate(() => ({
        span: window.maxPrice - window.minPrice,
        isAutoPriceScale: window.isAutoPriceScale,
        badgeText: document.getElementById('scale-status-text')?.innerText
    }));
    console.log('State after double click reset:', stateAfterReset);

    await page.screenshot({ path: 'scripts/price_axis_drag_screenshot.png' });
    console.log('Screenshot saved to scripts/price_axis_drag_screenshot.png');

    await browser.close();

    if (spanAfterDragDown.span > initSpan &&
        spanAfterDragUp.span < spanAfterDragDown.span &&
        spanAfterDragDown.isAutoPriceScale === false &&
        stateAfterReset.isAutoPriceScale === true) {
        console.log('\n--- SUCCESS: Right price axis sidebar scaling and double click reset verified! ---');
    } else {
        throw new Error('Price axis verification failed!');
    }
}

testPriceAxisSidebarDrag().catch(err => {
    console.error(err);
    process.exit(1);
});
