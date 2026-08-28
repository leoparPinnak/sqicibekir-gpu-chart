import { chromium } from 'playwright';

async function testHighThresholdDrag() {
    console.log('--- Testing High Threshold Drag & Unlocking in Playwright ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    // 1. Set threshold to 8.00 px/ms (Very High / Strict)
    await page.evaluate(() => {
        window.updateVelocityThreshold(8.00);
    });

    const initPriceOffset = await page.evaluate(() => window.priceOffset || (typeof priceOffset !== 'undefined' ? priceOffset : 0));
    console.log('1. Initial State with 8.00 px/ms threshold - priceOffset:', initPriceOffset);

    // 2. Perform slow vertical drag (drag from y=500 to y=350)
    await page.mouse.move(700, 500);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) {
        await page.mouse.move(700, 500 - i * 15);
        await page.waitForTimeout(30);
    }
    await page.mouse.up();
    await page.waitForTimeout(300);

    const postVerticalOffset = await page.evaluate(() => (typeof priceOffset !== 'undefined' ? priceOffset : null));
    const isAutoPostVertical = await page.evaluate(() => (typeof isAutoPriceScale !== 'undefined' ? isAutoPriceScale : null));
    console.log('2. After Vertical Drag - priceOffset:', postVerticalOffset, '| isAutoPriceScale:', isAutoPostVertical);

    await browser.close();

    if (isAutoPostVertical === false && Math.abs(postVerticalOffset) > 100) {
        console.log('\n--- ALL CHECKS PASSED: High threshold does NOT get stuck! Vertical movement unlocks instantly! ---');
    } else {
        throw new Error('Test failed: Chart is still locked in auto scale after vertical drag!');
    }
}

testHighThresholdDrag().catch(console.error);
