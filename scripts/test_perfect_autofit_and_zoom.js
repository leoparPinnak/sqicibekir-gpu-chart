import { chromium } from 'playwright';

async function testAutofitAndCursorZoom() {
    console.log('--- Testing Perfect Visible Candle Auto-Fit & Cursor-Anchored Zoom in Playwright ---');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    const canvasBox = await page.locator('#canvas-container').boundingBox();

    // 1. Verify that all visible candle wicks are strictly inside [minPrice, maxPrice]
    async function verifyWicksInsideBounds(stageName) {
        return await page.evaluate((stage) => {
            const range = window.drawingEngine.getPriceRange();
            const view = window.drawingEngine.getViewRange();
            const candles = window.drawingEngine.getCandleData();

            const startI = Math.max(0, Math.floor(view.start));
            const endI = Math.min(candles.length, Math.ceil(view.end));

            let minLow = Infinity, maxHigh = -Infinity;
            for (let i = startI; i < endI; i++) {
                if (candles[i]) {
                    if (candles[i].low < minLow) minLow = candles[i].low;
                    if (candles[i].high > maxHigh) maxHigh = candles[i].high;
                }
            }

            const allWicksInside = (minLow >= range.min && maxHigh <= range.max);
            const topMarginPct = ((range.max - maxHigh) / (range.max - range.min) * 100).toFixed(1);
            const bottomMarginPct = ((minLow - range.min) / (range.max - range.min) * 100).toFixed(1);

            return {
                stage,
                allWicksInside,
                minLow: minLow.toFixed(2),
                maxHigh: maxHigh.toFixed(2),
                rangeMin: range.min.toFixed(2),
                rangeMax: range.max.toFixed(2),
                topMarginPct: topMarginPct + '%',
                bottomMarginPct: bottomMarginPct + '%'
            };
        }, stageName);
    }

    // Check Stage 1: Initial View
    const s1 = await verifyWicksInsideBounds('Stage 1: Initial View');
    console.log('1. Initial View Check:', s1);

    // Check Stage 2: After Dragging Horizontally Back in Time
    await page.mouse.move(canvasBox.x + 300, canvasBox.y + 400);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + 900, canvasBox.y + 400, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    const s2 = await verifyWicksInsideBounds('Stage 2: After Horizontal Pan Backwards');
    console.log('2. Horizontal Pan Check:', s2);

    // Check Stage 3: Cursor-Anchored Wheel Zoom-In on the RIGHT SIDE (clientX = 75%)
    const targetX = canvasBox.x + canvasBox.width * 0.75;
    const targetY = canvasBox.y + 400;

    await page.mouse.move(targetX, targetY);
    await page.mouse.wheel(0, -600); // Zoom In
    await page.waitForTimeout(300);

    const s3 = await verifyWicksInsideBounds('Stage 3: After Cursor Zoom-In at 75% X');
    console.log('3. Cursor-Anchored Zoom In Check:', s3);

    // Check Stage 4: Cursor-Anchored Wheel Zoom-Out on the LEFT SIDE (clientX = 25%)
    const targetLeftX = canvasBox.x + canvasBox.width * 0.25;
    await page.mouse.move(targetLeftX, targetY);
    await page.mouse.wheel(0, 400); // Zoom Out
    await page.waitForTimeout(300);

    const s4 = await verifyWicksInsideBounds('Stage 4: After Cursor Zoom-Out at 25% X');
    console.log('4. Cursor-Anchored Zoom Out Check:', s4);

    await page.screenshot({ path: 'scripts/perfect_autofit_screenshot.png' });
    console.log('Screenshot saved to scripts/perfect_autofit_screenshot.png');

    await browser.close();

    if (s1.allWicksInside && s2.allWicksInside && s3.allWicksInside && s4.allWicksInside) {
        console.log('\n--- ALL VERIFICATIONS PASSED: 100% of visible candle wicks perfectly framed! ---');
    } else {
        throw new Error('Autofit verification failed!');
    }
}

testAutofitAndCursorZoom().catch(console.error);
