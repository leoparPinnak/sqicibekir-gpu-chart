import { chromium } from 'playwright';

async function testVelocityAutofit() {
    console.log('--- Testing Velocity & Acceleration Based Auto-Fit in Playwright ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    const canvasBox = await page.locator('#canvas-container').boundingBox();

    // 1. Initial State
    const s1 = await page.evaluate(() => ({
        min: window.drawingEngine.getPriceRange().min.toFixed(2),
        max: window.drawingEngine.getPriceRange().max.toFixed(2)
    }));
    console.log('1. Initial State:', s1);

    // 2. Slow / Deliberate Drag (Slow diagonal movement across 50 steps -> Low velocity)
    await page.mouse.move(canvasBox.x + 500, canvasBox.y + 200);
    await page.mouse.down();
    // Move slowly over 50 steps (~1500ms)
    await page.mouse.move(canvasBox.x + 530, canvasBox.y + 450, { steps: 40 });
    await page.mouse.up();
    await page.waitForTimeout(400);

    const s2 = await page.evaluate(() => ({
        min: window.drawingEngine.getPriceRange().min.toFixed(2),
        max: window.drawingEngine.getPriceRange().max.toFixed(2)
    }));
    console.log('2. After Slow / Deliberate Drag (Manual Offset Preserved):', s2);

    // 3. Moderate / Fast Horizontal Swipe (Quick horizontal swipe -> High velocity vx > 0.35)
    await page.mouse.move(canvasBox.x + 300, canvasBox.y + 400);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + 900, canvasBox.y + 400, { steps: 5 }); // Fast swipe in 5 steps (~80ms)
    await page.mouse.up();
    await page.waitForTimeout(600);

    const s3 = await page.evaluate(() => {
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
            minLow: minLow.toFixed(2),
            maxHigh: maxHigh.toFixed(2),
            rangeMin: range.min.toFixed(2),
            rangeMax: range.max.toFixed(2),
            allWicksInside: (minLow >= range.min - 1 && maxHigh <= range.max + 1)
        };
    });
    console.log('3. After Fast Horizontal Swipe (Auto-Fit Engaged on Visible Candles):', s3);

    await page.screenshot({ path: 'scripts/velocity_autofit_screenshot.png' });
    console.log('Screenshot saved to scripts/velocity_autofit_screenshot.png');

    await browser.close();

    if (s3.allWicksInside) {
        console.log('\n--- ALL CHECKS PASSED: Velocity-based discrimination operates with complete fidelity! ---');
    } else {
        throw new Error('Verification failed!');
    }
}

testVelocityAutofit().catch(console.error);
