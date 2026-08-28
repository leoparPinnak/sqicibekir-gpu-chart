import { chromium } from 'playwright';

async function testExtremeVerticalPan() {
    console.log('--- Testing Extreme Free Vertical Panning in Playwright ---');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    const canvasBox = await page.locator('#canvas-container').boundingBox();

    // 1. Initial State
    const p0 = await page.evaluate(() => ({
        min: window.drawingEngine.getPriceRange().min.toFixed(2),
        max: window.drawingEngine.getPriceRange().max.toFixed(2)
    }));
    console.log('Initial Range:', p0);

    // 2. Perform 4 large downward pan gestures in a row!
    for (let i = 1; i <= 4; i++) {
        await page.mouse.move(canvasBox.x + 500, canvasBox.y + 150);
        await page.mouse.down();
        await page.mouse.move(canvasBox.x + 500, canvasBox.y + 650, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(100);

        const pCurrent = await page.evaluate(() => ({
            min: window.drawingEngine.getPriceRange().min.toFixed(2),
            max: window.drawingEngine.getPriceRange().max.toFixed(2)
        }));
        console.log(`After Large Pan #${i}:`, pCurrent);
    }

    await page.screenshot({ path: 'scripts/extreme_vertical_pan_screenshot.png' });
    console.log('Saved screenshot to scripts/extreme_vertical_pan_screenshot.png');

    await browser.close();
    console.log('\n--- Extreme Vertical Pan Test Completed! ---');
}

testExtremeVerticalPan().catch(console.error);
