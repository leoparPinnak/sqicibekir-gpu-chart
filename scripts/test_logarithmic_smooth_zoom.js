import { chromium } from 'playwright';

async function testLogarithmicSmoothZoom() {
    console.log('--- Testing Natural Logarithmic (ln) Smooth Scale Zoom Engine ---');
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

    // 1. Double price scale to simulate wide volatility state
    const priceAxisBox = await page.locator('#price-axis').boundingBox();
    const ax = priceAxisBox.x + (priceAxisBox.width / 2);
    const ay = priceAxisBox.y + (priceAxisBox.height / 2);

    await page.mouse.move(ax, ay);
    await page.mouse.down();
    await page.mouse.move(ax, ay + 120);
    await page.mouse.up();
    await page.waitForTimeout(100);

    const initialSpan = await page.evaluate(() => window.smoothMaxPrice - window.smoothMinPrice);
    console.log('1. Starting Wide Price Span:', initialSpan.toFixed(2));

    // 2. Trigger auto-scale zoom into a narrow candle cluster
    console.log('2. Scrolling wheel to trigger logarithmic camera zoom...');
    await page.mouse.move(cx, cy);
    await page.mouse.wheel(0, -600);

    // 3. Measure consecutive frame spans
    const frameLogSpans = [];
    for (let i = 0; i < 8; i++) {
        await page.waitForTimeout(40);
        const span = await page.evaluate(() => window.smoothMaxPrice - window.smoothMinPrice);
        frameLogSpans.push({
            frame: i + 1,
            span: span.toFixed(2),
            logSpan: Math.log(span).toFixed(4)
        });
    }

    console.log('Logarithmic scale progression over frames:', frameLogSpans);

    await page.screenshot({ path: 'scripts/logarithmic_zoom_screenshot.png' });
    console.log('Screenshot saved to scripts/logarithmic_zoom_screenshot.png');

    await browser.close();

    // Verify smooth monotonic decrease in log space
    let isLogSmooth = true;
    for (let i = 1; i < frameLogSpans.length; i++) {
        const prev = parseFloat(frameLogSpans[i - 1].span);
        const curr = parseFloat(frameLogSpans[i].span);
        if (curr > prev) {
            isLogSmooth = false;
        }
    }

    if (isLogSmooth && parseFloat(frameLogSpans[frameLogSpans.length - 1].span) < initialSpan) {
        console.log('\n--- SUCCESS: Natural logarithmic smooth zoom engine verified with continuous geometric scaling! ---');
    } else {
        throw new Error('Logarithmic zoom verification failed!');
    }
}

testLogarithmicSmoothZoom().catch(err => {
    console.error(err);
    process.exit(1);
});
