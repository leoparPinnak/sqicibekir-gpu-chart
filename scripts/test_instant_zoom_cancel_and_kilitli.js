import { chromium } from 'playwright';

async function testInstantZoomCancelAndKilitli() {
    console.log('--- Testing Instant Zoom Cancel on Drag & Kilitli Button Clickability ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://127.0.0.1:5173');
    await page.waitForFunction(() => window.totalCandles > 1000 && window.minPrice > 0, { timeout: 15000 });
    await page.waitForTimeout(500);

    // 1. Test clicking directly on "Kilitli" button
    console.log('1. Clicking on #mode-btn-locked (Kilitli)...');
    await page.locator('#mode-btn-locked').click();
    await page.waitForTimeout(100);

    const currentModeAfterClick = await page.evaluate(() => window.scaleMode);
    const isAutoAfterClick = await page.evaluate(() => window.isAutoPriceScale);
    const badgeTextAfterClick = await page.locator('#scale-status-text').innerText();
    console.log(`State after clicking Kilitli: mode=${currentModeAfterClick}, isAuto=${isAutoAfterClick}, badge="${badgeTextAfterClick}"`);

    // 2. Switch to "İvmeli" mode
    console.log('2. Switching to "İvmeli" mode...');
    await page.locator('#mode-btn-velocity').click();
    await page.waitForTimeout(100);

    // 3. Trigger wheel zoom, then IMMEDIATELY click & drag vertically within 50ms
    const canvasBox = await page.locator('#canvas-container').boundingBox();
    const cx = canvasBox.x + 700;
    const cy = canvasBox.y + 450;

    console.log('3. Triggering wheel zoom and IMMEDIATELY dragging vertically...');
    await page.mouse.move(cx, cy);
    await page.mouse.wheel(0, -500); // starts zoom animation
    await page.waitForTimeout(50); // wait only 50ms into animation

    const isZoomingBeforeDrag = await page.evaluate(() => window.isZoomAnimating);
    console.log(`isZoomAnimating at 50ms: ${isZoomingBeforeDrag}`);

    // Mousedown and drag vertically 120px
    await page.mouse.down();
    await page.mouse.move(cx, cy - 120, { steps: 5 });

    const isZoomingDuringDrag = await page.evaluate(() => window.isZoomAnimating);
    const isAutoDuringDrag = await page.evaluate(() => window.isAutoPriceScale);
    const priceOffsetDuringDrag = await page.evaluate(() => window.priceOffset);
    console.log(`State during vertical drag: isZoomAnimating=${isZoomingDuringDrag} (Expected: false), isAuto=${isAutoDuringDrag} (Expected: false), priceOffset=${priceOffsetDuringDrag}`);

    await page.mouse.up();
    await page.waitForTimeout(400); // wait past the original zoom duration to ensure no trailing override

    const finalPriceOffset = await page.evaluate(() => window.priceOffset);
    console.log(`Price offset after waiting full zoom duration: ${finalPriceOffset} (Should be preserved!)`);

    // 4. Test Space key auto-fit
    console.log('4. Pressing Space key...');
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);

    const priceOffsetAfterSpace = await page.evaluate(() => window.priceOffset);
    console.log(`Price offset after Space key: ${priceOffsetAfterSpace} (Expected: 0)`);

    await page.screenshot({ path: 'scripts/zoom_cancel_and_kilitli_screenshot.png' });
    console.log('Screenshot saved to scripts/zoom_cancel_and_kilitli_screenshot.png');

    await browser.close();

    if (currentModeAfterClick === 'locked' && isAutoAfterClick === true && isZoomingDuringDrag === false && isAutoDuringDrag === false && priceOffsetAfterSpace === 0) {
        console.log('\n--- SUCCESS: Kilitli clickability and instant zoom cancel 100% verified! ---');
    } else {
        throw new Error('Verification failed!');
    }
}

testInstantZoomCancelAndKilitli().catch(err => {
    console.error(err);
    process.exit(1);
});
