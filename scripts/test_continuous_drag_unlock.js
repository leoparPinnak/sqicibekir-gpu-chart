import { chromium } from 'playwright';

async function testContinuousDragUnlock() {
    console.log('--- Testing Continuous Drag Axis Lock & Real-Time Dynamic Unlock ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForFunction(() => window.totalCandles > 1000 && window.minPrice > 0, { timeout: 15000 });
    await page.waitForTimeout(500);

    const canvasBox = await page.locator('#canvas-container').boundingBox();
    if (!canvasBox) throw new Error('Canvas container not found');

    const startX = canvasBox.x + 800;
    const startY = canvasBox.y + 400;

    console.log('1. Starting mouse drag at:', { startX, startY });
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.waitForTimeout(50);

    // 2. Perform fast horizontal swipe (high velocity to trigger threshold exceed)
    console.log('2. Performing fast horizontal swipe to trigger threshold exceed...');
    for (let step = 1; step <= 8; step++) {
        const curX = startX - (step * 70); // 560px in ~40ms -> ~14 px/ms
        await page.mouse.move(curX, startY);
        await page.waitForTimeout(5);
    }

    const stateAfterFastSwipe = await page.evaluate(() => ({
        isAutoPriceScale: window.isAutoPriceScale,
        hudAlertText: document.getElementById('hud-alert-text')?.innerText,
        hudBadgeClass: document.getElementById('hud-alert-badge')?.className
    }));
    console.log('State after fast swipe:', stateAfterFastSwipe);

    // 3. WITHOUT RELEASING MOUSE, pause (velocity drops) and drag vertically!
    console.log('3. Without releasing mouse button, slowing down and dragging vertically...');
    await page.waitForTimeout(200); // velocity settles to 0

    const currentX = startX - 560;
    for (let step = 1; step <= 10; step++) {
        const curY = startY - (step * 15); // moving up by 150px
        await page.mouse.move(currentX, curY);
        await page.waitForTimeout(20);
    }

    const stateAfterVerticalDrag = await page.evaluate(() => ({
        isAutoPriceScale: window.isAutoPriceScale,
        priceOffset: window.priceOffset,
        hudAlertText: document.getElementById('hud-alert-text')?.innerText,
        hudBadgeClass: document.getElementById('hud-alert-badge')?.className
    }));
    console.log('State after continuous vertical drag (same mouse-down gesture):', stateAfterVerticalDrag);

    // 4. Release mouse
    await page.mouse.up();
    await page.waitForTimeout(200);

    await page.screenshot({ path: 'scripts/continuous_drag_unlock_screenshot.png' });
    console.log('Screenshot saved to scripts/continuous_drag_unlock_screenshot.png');

    await browser.close();

    if (stateAfterFastSwipe.isAutoPriceScale === true &&
        stateAfterVerticalDrag.isAutoPriceScale === false &&
        stateAfterVerticalDrag.priceOffset !== 0) {
        console.log('\n--- SUCCESS: Dynamic Axis Unlock during continuous mouse drag verified! ---');
    } else {
        throw new Error(`Test failed! Fast swipe: ${JSON.stringify(stateAfterFastSwipe)}, Vertical drag: ${JSON.stringify(stateAfterVerticalDrag)}`);
    }
}

testContinuousDragUnlock().catch(err => {
    console.error(err);
    process.exit(1);
});
