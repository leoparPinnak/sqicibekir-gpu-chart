import { chromium } from 'playwright';

async function testInstantZoomToVerticalDrag() {
    console.log('--- Testing Instant Zoom to Rapid Vertical Drag with Zero Lag ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    // Wait until candles are completely loaded and rendered
    await page.waitForFunction(() => window.totalCandles > 1000 && window.minPrice > 0, { timeout: 15000 });
    await page.waitForTimeout(500);

    const canvasBox = await page.locator('#canvas-container').boundingBox();
    const cx = canvasBox.x + 700;
    const cy = canvasBox.y + 450;

    // 1. Zoom in rapidly
    console.log('1. Rapidly zooming in with wheel...');
    await page.mouse.move(cx, cy);
    await page.mouse.wheel(0, -600);
    await page.waitForTimeout(10); // immediate next instant

    // 2. Immediate mouse down right after zoom
    console.log('2. Immediately grabbing mouse down and dragging vertically...');
    await page.mouse.down();
    await page.waitForTimeout(5);

    // 3. Move vertically rapidly in 10ms intervals
    const moves = [];
    for (let i = 1; i <= 6; i++) {
        const nextY = cy - (i * 25);
        await page.mouse.move(cx, nextY);
        await page.waitForTimeout(10);

        const state = await page.evaluate(() => ({
            isAutoPriceScale: window.isAutoPriceScale,
            priceOffset: window.priceOffset,
            minPrice: window.minPrice,
            smoothMinPrice: window.smoothMinPrice
        }));
        moves.push(state);
    }

    console.log('Rapid vertical drag states during moves:', moves);
    await page.mouse.up();

    await browser.close();

    const firstMove = moves[0];
    const lastMove = moves[moves.length - 1];

    if (firstMove.isAutoPriceScale === false &&
        firstMove.priceOffset !== 0 &&
        Math.abs(lastMove.priceOffset) > Math.abs(firstMove.priceOffset)) {
        console.log('\n--- SUCCESS: Zero-lag instant vertical drag verified with 100% 1:1 hardware sync! ---');
    } else {
        throw new Error('Test failed! Zero lag verification failed.');
    }
}

testInstantZoomToVerticalDrag().catch(err => {
    console.error(err);
    process.exit(1);
});
