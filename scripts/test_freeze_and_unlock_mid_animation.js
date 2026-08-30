import { chromium } from 'playwright';

async function testFreezeAndUnlockMidAnimation() {
    console.log('--- Testing Animation Freeze and Immediate Vertical Unlock on Mouse Down ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    const canvasBox = await page.locator('#canvas-container').boundingBox();
    if (!canvasBox) throw new Error('Canvas container not found');

    const clickX = canvasBox.x + 700;
    const clickY = canvasBox.y + 400;

    // 1. Trigger large zoom in to start an ongoing LERP animation
    console.log('1. Triggering large zoom in animation...');
    await page.mouse.move(clickX, clickY);
    await page.mouse.wheel(0, -1200);

    // 2. Wait 40ms so animation is actively moving/interpolating
    await page.waitForTimeout(40);

    // 3. Click and hold down (MouseDown) right mid-animation!
    console.log('2. Clicking and holding mouse down mid-animation at:', { clickX, clickY });
    await page.mouse.down();
    await page.waitForTimeout(30);

    const stateOnMouseDown = await page.evaluate(() => ({
        isAutoPriceScale: window.isAutoPriceScale,
        viewStart: window.viewStart,
        smoothViewStart: window.smoothViewStart,
        minPrice: window.minPrice,
        smoothMinPrice: window.smoothMinPrice,
        hudAlertText: document.getElementById('hud-alert-text')?.innerText,
        hudBadgeClass: document.getElementById('hud-alert-badge')?.className
    }));
    console.log('State immediately upon MouseDown mid-animation:', stateOnMouseDown);

    // 4. Drag vertically while holding mouse down to confirm immediate vertical free panning
    console.log('3. Dragging vertically 100px up while holding mouse down...');
    for (let step = 1; step <= 8; step++) {
        await page.mouse.move(clickX, clickY - (step * 15));
        await page.waitForTimeout(15);
    }

    const stateAfterDrag = await page.evaluate(() => ({
        isAutoPriceScale: window.isAutoPriceScale,
        priceOffset: window.priceOffset,
        hudAlertText: document.getElementById('hud-alert-text')?.innerText
    }));
    console.log('State after vertical drag:', stateAfterDrag);

    await page.mouse.up();
    await page.waitForTimeout(100);

    await page.screenshot({ path: 'scripts/freeze_mid_animation_screenshot.png' });
    console.log('Screenshot saved to scripts/freeze_mid_animation_screenshot.png');

    await browser.close();

    const isFrozen = Math.abs(stateOnMouseDown.viewStart - stateOnMouseDown.smoothViewStart) < 2.0;
    if (isFrozen && stateOnMouseDown.isAutoPriceScale === false && stateAfterDrag.priceOffset !== 0) {
        console.log('\n--- SUCCESS: Mid-animation click freeze and instant vertical unlock verified! ---');
    } else {
        throw new Error(`Test failed! State on click: ${JSON.stringify(stateOnMouseDown)}, after drag: ${JSON.stringify(stateAfterDrag)}`);
    }
}

testFreezeAndUnlockMidAnimation().catch(err => {
    console.error(err);
    process.exit(1);
});
