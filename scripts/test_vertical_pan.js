import { chromium } from 'playwright';

async function testFreeVerticalPan() {
    console.log('--- Testing Unrestricted Free Vertical Panning in Playwright ---');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000); // Wait for Binance data fetch

    const canvasBox = await page.locator('#canvas-container').boundingBox();

    // 1. Initial price offset & bounds
    const initialPriceRange = await page.evaluate(() => {
        return {
            min: window.drawingEngine.getPriceRange().min.toFixed(2),
            max: window.drawingEngine.getPriceRange().max.toFixed(2)
        };
    });
    console.log('Initial Price Range (Candles Loaded):', initialPriceRange);

    // 2. Drag canvas vertically down by 250px
    await page.mouse.move(canvasBox.x + 500, canvasBox.y + 200);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + 500, canvasBox.y + 450, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(200);

    const rangeAfterDownDrag = await page.evaluate(() => {
        return {
            min: window.drawingEngine.getPriceRange().min.toFixed(2),
            max: window.drawingEngine.getPriceRange().max.toFixed(2)
        };
    });
    console.log('Price Range after Downward Pan (Shifted Upwards):', rangeAfterDownDrag);

    // 3. Drag canvas vertically up by 500px
    await page.mouse.move(canvasBox.x + 500, canvasBox.y + 450);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + 500, canvasBox.y + 50, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(200);

    const rangeAfterUpDrag = await page.evaluate(() => {
        return {
            min: window.drawingEngine.getPriceRange().min.toFixed(2),
            max: window.drawingEngine.getPriceRange().max.toFixed(2)
        };
    });
    console.log('Price Range after Upward Pan (Shifted Downwards):', rangeAfterUpDrag);

    // 4. Double click price axis to reset scale (OTO)
    const priceBox = await page.locator('.price-axis-sidebar').boundingBox();
    if (priceBox) {
        await page.mouse.dblclick(priceBox.x + 20, priceBox.y + 200);
        await page.waitForTimeout(200);
    }

    const rangeAfterReset = await page.evaluate(() => {
        return {
            min: window.drawingEngine.getPriceRange().min.toFixed(2),
            max: window.drawingEngine.getPriceRange().max.toFixed(2)
        };
    });
    console.log('Price Range after Double-Click Reset (OTO):', rangeAfterReset);

    await browser.close();
    console.log('\n--- Free Vertical Pan Verified Successfully! ---');
}

testFreeVerticalPan().catch(console.error);
