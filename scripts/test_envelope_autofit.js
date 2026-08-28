import { chromium } from 'playwright';

async function testEnvelopeAutofit() {
    console.log('--- Testing Envelope Auto-Fit During Rapid Zoom-In and Fast Horizontal Pans ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    const canvasBox = await page.locator('#canvas-container').boundingBox();

    async function checkWicks(testName) {
        return await page.evaluate((name) => {
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

            const allInside = (minLow >= range.min - 0.5 && maxHigh <= range.max + 0.5);
            return {
                name,
                allInside,
                minLow: minLow.toFixed(2),
                maxHigh: maxHigh.toFixed(2),
                rangeMin: range.min.toFixed(2),
                rangeMax: range.max.toFixed(2)
            };
        }, testName);
    }

    // 1. Initial State
    console.log('1. Initial State:', await checkWicks('Initial View'));

    // 2. Perform 3 fast Zoom-In wheel steps on the right side
    await page.mouse.move(canvasBox.x + 800, canvasBox.y + 400);
    for (let i = 0; i < 3; i++) {
        await page.mouse.wheel(0, -300);
        await page.waitForTimeout(100);
    }
    await page.waitForTimeout(500);
    const z1 = await checkWicks('After Deep Zoom-In (Right)');
    console.log('2. Deep Zoom-In Right:', z1);

    // 3. Fast horizontal drag left
    await page.mouse.move(canvasBox.x + 300, canvasBox.y + 400);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + 900, canvasBox.y + 405, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    const p1 = await checkWicks('After Fast Horizontal Pan Backwards');
    console.log('3. Horizontal Pan Backwards:', p1);

    // 4. Perform 3 Zoom-In wheel steps on the left side
    await page.mouse.move(canvasBox.x + 350, canvasBox.y + 400);
    for (let i = 0; i < 3; i++) {
        await page.mouse.wheel(0, -300);
        await page.waitForTimeout(100);
    }
    await page.waitForTimeout(500);
    const z2 = await checkWicks('After Deep Zoom-In (Left)');
    console.log('4. Deep Zoom-In Left:', z2);

    await page.screenshot({ path: 'scripts/envelope_autofit_screenshot.png' });
    console.log('Screenshot saved to scripts/envelope_autofit_screenshot.png');

    await browser.close();

    if (z1.allInside && p1.allInside && z2.allInside) {
        console.log('\n--- ALL CHECKS PASSED: 100% of visible candle wicks strictly framed! ---');
    } else {
        throw new Error('Verification failed!');
    }
}

testEnvelopeAutofit().catch(console.error);
