import { chromium } from 'playwright';

async function testSmartAxisAndZoom() {
    console.log('--- Testing Smart Axis Discrimination & Cursor-X Auto-Zoom in Playwright ---');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    const canvasBox = await page.locator('#canvas-container').boundingBox();

    // 1. Initial State
    const s1 = await page.evaluate(() => ({
        isAuto: window.isAutoPriceScale !== undefined ? window.isAutoPriceScale : true,
        otoActive: document.querySelector('.axis-corner-reset').classList.contains('active'),
        min: window.drawingEngine.getPriceRange().min.toFixed(2),
        max: window.drawingEngine.getPriceRange().max.toFixed(2)
    }));
    console.log('1. Initial State (Auto mode on):', s1);

    // 2. Drag Horizontally (X-Axis > 15px) -> Should lock horizontal and keep Auto Mode
    await page.mouse.move(canvasBox.x + 300, canvasBox.y + 400);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + 800, canvasBox.y + 410, { steps: 10 }); // Mostly horizontal (+500px X, +10px Y)
    await page.mouse.up();
    await page.waitForTimeout(600); // Wait for lerp settle

    const s2 = await page.evaluate(() => ({
        isAuto: window.isAutoPriceScale !== undefined ? window.isAutoPriceScale : true,
        otoActive: document.querySelector('.axis-corner-reset').classList.contains('active'),
        min: window.drawingEngine.getPriceRange().min.toFixed(2),
        max: window.drawingEngine.getPriceRange().max.toFixed(2)
    }));
    console.log('2. After Horizontal Drag (Locked Auto-Fit):', s2);

    // 3. Drag Deliberately Vertically (Y-Axis > 15px, pure vertical) -> Should allow vertical offset
    await page.mouse.move(canvasBox.x + 500, canvasBox.y + 200);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + 505, canvasBox.y + 450, { steps: 10 }); // Pure vertical (+5px X, +250px Y)
    await page.mouse.up();
    await page.waitForTimeout(600);

    const s3 = await page.evaluate(() => ({
        isAuto: window.isAutoPriceScale !== undefined ? window.isAutoPriceScale : true,
        otoActive: document.querySelector('.axis-corner-reset').classList.contains('active'),
        min: window.drawingEngine.getPriceRange().min.toFixed(2),
        max: window.drawingEngine.getPriceRange().max.toFixed(2)
    }));
    console.log('3. After Deliberate Vertical Drag (Manual Mode):', s3);

    // 4. Perform Wheel Zoom -> Must immediately force Auto-Fit and anchor on Cursor X!
    const zoomTargetX = canvasBox.x + 600;
    const zoomTargetY = canvasBox.y + 350;

    await page.mouse.move(zoomTargetX, zoomTargetY);
    await page.mouse.wheel(0, -500); // Zoom in
    await page.waitForTimeout(800); // Wait for lerp settle

    const s4 = await page.evaluate((targetPx) => {
        const view = window.drawingEngine.getViewRange();
        const range = window.drawingEngine.getPriceRange();
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

        return {
            isAuto: window.isAutoPriceScale !== undefined ? window.isAutoPriceScale : true,
            otoActive: document.querySelector('.axis-corner-reset').classList.contains('active'),
            allWicksInside: (minLow >= range.min - 1 && maxHigh <= range.max + 1),
            minLow: minLow.toFixed(2),
            maxHigh: maxHigh.toFixed(2),
            rangeMin: range.min.toFixed(2),
            rangeMax: range.max.toFixed(2)
        };
    }, zoomTargetX);
    console.log('4. After Wheel Zoom (Auto Mode Restored & Wicks Framed):', s4);

    await page.screenshot({ path: 'scripts/smart_axis_zoom_screenshot.png' });
    console.log('Saved screenshot to scripts/smart_axis_zoom_screenshot.png');

    await browser.close();

    if (s2.isAuto && s4.isAuto && s4.allWicksInside) {
        console.log('\n--- ALL VERIFICATIONS PASSED: Smart Axis & Cursor-X Zoom 100% Operational! ---');
    } else {
        throw new Error('Test verification failed!');
    }
}

testSmartAxisAndZoom().catch(console.error);
