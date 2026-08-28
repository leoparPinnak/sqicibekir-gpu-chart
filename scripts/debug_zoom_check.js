import { chromium } from 'playwright';

async function testSmartAxisAndZoom() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    const canvasBox = await page.locator('#canvas-container').boundingBox();

    // Check zoom in step 4
    const zoomTargetX = canvasBox.x + 600;
    const zoomTargetY = canvasBox.y + 350;

    await page.mouse.move(zoomTargetX, zoomTargetY);
    await page.mouse.wheel(0, -500); // Zoom in
    await page.waitForTimeout(800);

    const check = await page.evaluate(() => {
        const view = window.drawingEngine.getViewRange();
        const range = window.drawingEngine.getPriceRange();
        const candles = window.drawingEngine.getCandleData();

        const curStart = Math.max(0, Math.floor(view.start));
        const curEnd = Math.min(candles.length, Math.ceil(view.end));

        let minLow = Infinity, maxHigh = -Infinity;
        for (let i = curStart; i < curEnd; i++) {
            if (candles[i]) {
                if (candles[i].low < minLow) minLow = candles[i].low;
                if (candles[i].high > maxHigh) maxHigh = candles[i].high;
            }
        }

        return {
            curStart,
            curEnd,
            candleCount: curEnd - curStart,
            minLow: minLow.toFixed(2),
            maxHigh: maxHigh.toFixed(2),
            rangeMin: range.min.toFixed(2),
            rangeMax: range.max.toFixed(2),
            allWicksInside: (minLow >= range.min && maxHigh <= range.max)
        };
    });

    console.log('Zoom in check result:', check);
    await browser.close();
}

testSmartAxisAndZoom().catch(console.error);
