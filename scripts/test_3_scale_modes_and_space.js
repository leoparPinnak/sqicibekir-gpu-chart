import { chromium } from 'playwright';

async function test3ScaleModesAndSpace() {
    console.log('--- Testing 3-Way Scale Modes (Serbest | İvmeli | Kilitli) & Space Auto-Fit ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://127.0.0.1:5173');
    await page.waitForFunction(() => window.totalCandles > 1000 && window.minPrice > 0, { timeout: 15000 });
    await page.waitForTimeout(500);

    // 1. Verify 3 buttons exist
    const btnFree = page.locator('#mode-btn-free');
    const btnVelocity = page.locator('#mode-btn-velocity');
    const btnLocked = page.locator('#mode-btn-locked');

    console.log('1. Checking 3-way buttons...');
    if (await btnFree.count() === 0 || await btnVelocity.count() === 0 || await btnLocked.count() === 0) {
        throw new Error('3-way scale mode buttons not found in DOM!');
    }

    // 2. Test FREE mode (Serbest)
    console.log('2. Switching to "Serbest (Free)" mode...');
    await btnFree.click();
    await page.waitForTimeout(100);

    const mode1 = await page.evaluate(() => window.scaleMode);
    console.log(`Current scaleMode: ${mode1}`);

    const canvasBox = await page.locator('#canvas-container').boundingBox();
    const cx = canvasBox.x + 700;
    const cy = canvasBox.y + 450;

    // Fast horizontal swipe in FREE mode -> Should NOT lock
    console.log('Testing fast horizontal swipe in FREE mode (should NOT lock)...');
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    for (let i = 0; i < 5; i++) {
        await page.mouse.move(cx - (i + 1) * 80, cy, { steps: 2 });
        await page.waitForTimeout(16);
    }
    await page.mouse.up();

    const isAutoInFree = await page.evaluate(() => window.isAutoPriceScale);
    console.log(`isAutoPriceScale after fast swipe in FREE mode: ${isAutoInFree} (Expected: false)`);

    // 3. Test SPACE key Auto-Fit
    console.log('3. Testing SPACE key Auto-Fit...');
    // Manually drag vertically to offset price
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx, cy - 150, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(100);

    const offsetBeforeSpace = await page.evaluate(() => window.priceOffset);
    console.log(`Price offset before Space: ${offsetBeforeSpace}`);

    await page.keyboard.press('Space');
    await page.waitForTimeout(300);

    const offsetAfterSpace = await page.evaluate(() => window.priceOffset);
    console.log(`Price offset after Space: ${offsetAfterSpace} (Expected: 0)`);

    // 4. Test LOCKED mode (Kilitli)
    console.log('4. Switching to "Kilitli (Locked)" mode...');
    await btnLocked.click();
    await page.waitForTimeout(100);

    const mode2 = await page.evaluate(() => window.scaleMode);
    const isAutoInLocked = await page.evaluate(() => window.isAutoPriceScale);
    console.log(`scaleMode: ${mode2}, isAutoPriceScale: ${isAutoInLocked} (Expected: locked, true)`);

    // 5. Test VELOCITY mode (İvmeli)
    console.log('5. Switching to "İvmeli (Velocity)" mode...');
    await btnVelocity.click();
    await page.waitForTimeout(100);

    const mode3 = await page.evaluate(() => window.scaleMode);
    console.log(`scaleMode: ${mode3} (Expected: velocity)`);

    await page.screenshot({ path: 'scripts/scale_mode_3way_screenshot.png' });
    console.log('Screenshot saved to scripts/scale_mode_3way_screenshot.png');

    await browser.close();

    if (mode1 === 'free' && isAutoInFree === false && offsetAfterSpace === 0 && mode2 === 'locked' && isAutoInLocked === true && mode3 === 'velocity') {
        console.log('\n--- SUCCESS: 3-way scale modes & Space auto-fit 100% verified! ---');
    } else {
        throw new Error('Verification failed!');
    }
}

test3ScaleModesAndSpace().catch(err => {
    console.error(err);
    process.exit(1);
});
