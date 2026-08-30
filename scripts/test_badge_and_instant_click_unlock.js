import { chromium } from 'playwright';

async function testBadgeAndInstantClickUnlock() {
    console.log('--- Testing Live Scale Status Badge & Instant Click Unlock ---');
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

    // 1. Initial status badge state
    const initBadge = await page.locator('#scale-status-text').innerText();
    console.log('1. Initial status badge text:', initBadge);

    // 2. Perform rapid zoom in
    console.log('2. Rapidly zooming in with wheel...');
    await page.mouse.move(cx, cy);
    await page.mouse.wheel(0, -800);
    await page.waitForTimeout(20);

    const zoomBadge = await page.locator('#scale-status-text').innerText();
    console.log('Status badge during zoom:', zoomBadge);

    // 3. Click down on chart (MouseDown)
    console.log('3. Clicking mouse down on chart...');
    await page.mouse.down();
    await page.waitForTimeout(20);

    const clickBadge = await page.locator('#scale-status-text').innerText();
    const clickIsAuto = await page.evaluate(() => window.isAutoPriceScale);
    console.log(`Status badge immediately upon click: "${clickBadge}", isAutoPriceScale: ${clickIsAuto}`);

    // 4. Drag up 100px
    console.log('4. Dragging up 100px...');
    for (let i = 1; i <= 5; i++) {
        await page.mouse.move(cx, cy - (i * 20));
        await page.waitForTimeout(10);
    }

    const afterDrag = await page.evaluate(() => ({
        priceOffset: window.priceOffset,
        isAutoPriceScale: window.isAutoPriceScale,
        badgeText: document.getElementById('scale-status-text')?.innerText
    }));
    console.log('State after vertical drag:', afterDrag);

    await page.screenshot({ path: 'scripts/scale_status_badge_screenshot.png' });
    console.log('Screenshot saved to scripts/scale_status_badge_screenshot.png');

    await page.mouse.up();
    await browser.close();

    if (initBadge.includes('AÇIK') && clickBadge.includes('DEVRE DIŞI') && clickIsAuto === false && afterDrag.priceOffset !== 0) {
        console.log('\n--- SUCCESS: Scale status badge & instant click unlock completely verified! ---');
    } else {
        throw new Error('Verification failed!');
    }
}

testBadgeAndInstantClickUnlock().catch(err => {
    console.error(err);
    process.exit(1);
});
