import { chromium } from 'playwright';

async function testAutofitPersistence() {
    console.log('--- Testing Auto-Fit Position Persistence in Playwright ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    // 1. Manually drag vertically to create an offset
    await page.mouse.move(700, 500);
    await page.mouse.down();
    for (let i = 1; i <= 6; i++) {
        await page.mouse.move(700, 500 - i * 20);
        await page.waitForTimeout(25);
    }
    await page.mouse.up();
    await page.waitForTimeout(200);

    const manualOffset = await page.evaluate(() => (typeof priceOffset !== 'undefined' ? priceOffset : null));
    console.log('1. Created Manual Vertical Offset:', manualOffset);

    // 2. Now perform a fast horizontal swipe to trigger auto-fit, then SLOW DOWN significantly
    await page.mouse.move(700, 380);
    await page.mouse.down();
    
    // Fast swipe steps (x=700 -> x=400 in 60ms)
    await page.mouse.move(600, 380);
    await page.waitForTimeout(15);
    await page.mouse.move(500, 380);
    await page.waitForTimeout(15);
    await page.mouse.move(400, 380);
    await page.waitForTimeout(20);

    // Now SLOW DOWN to a crawl (1px steps with 80ms delays)
    for (let x = 399; x >= 385; x--) {
        await page.mouse.move(x, 380);
        await page.waitForTimeout(60);
    }

    const offsetDuringSlowDrag = await page.evaluate(() => (typeof priceOffset !== 'undefined' ? priceOffset : null));
    const isAutoDuringSlow = await page.evaluate(() => (typeof isAutoPriceScale !== 'undefined' ? isAutoPriceScale : null));
    console.log('2. State during slow drag after fast swipe - priceOffset:', offsetDuringSlowDrag, '| isAuto:', isAutoDuringSlow);

    await page.mouse.up();
    await page.waitForTimeout(200);

    const finalOffset = await page.evaluate(() => (typeof priceOffset !== 'undefined' ? priceOffset : null));
    console.log('3. Final State after release - priceOffset:', finalOffset);

    await browser.close();

    if (offsetDuringSlowDrag === 0 && finalOffset === 0 && isAutoDuringSlow === true) {
        console.log('\n--- ALL CHECKS PASSED: Auto-fit position NEVER reverts to old offset! It stays exactly on the newly visible candles! ---');
    } else {
        throw new Error(`Persistence failed! offsetDuringSlowDrag: ${offsetDuringSlowDrag}, finalOffset: ${finalOffset}`);
    }
}

testAutofitPersistence().catch(console.error);
