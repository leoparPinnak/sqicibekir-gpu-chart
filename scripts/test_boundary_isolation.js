import { chromium } from 'playwright';

async function testBoundaryIsolation() {
    console.log('--- Testing Strict Boundary Isolation in Playwright ---');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1000);

    // 1. Select Trend Line Tool
    await page.evaluate(() => window.selectTvTool('trendline'));

    const initialDrawings = await page.evaluate(() => window.drawingEngine.drawings.length);
    console.log('Initial drawings count:', initialDrawings);

    // 2. Click on the RIGHT PRICE AXIS (price bar)
    const priceBox = await page.locator('.price-axis-sidebar').boundingBox();
    if (priceBox) {
        console.log('Clicking inside right price axis bar at:', priceBox.x + 20, priceBox.y + 200);
        await page.mouse.click(priceBox.x + 20, priceBox.y + 200);
        await page.waitForTimeout(50);
        await page.mouse.click(priceBox.x + 20, priceBox.y + 350);
        await page.waitForTimeout(50);
    }

    const countAfterPriceClick = await page.evaluate(() => window.drawingEngine.drawings.length);
    console.log('Drawings count after clicking price axis (Must be 0):', countAfterPriceClick);

    // 3. Click on the BOTTOM TIME AXIS bar
    const timeBox = await page.locator('.time-axis-bar').boundingBox();
    if (timeBox) {
        console.log('Clicking inside bottom time axis bar at:', timeBox.x + 300, timeBox.y + 10);
        await page.mouse.click(timeBox.x + 300, timeBox.y + 10);
        await page.waitForTimeout(50);
    }

    const countAfterTimeClick = await page.evaluate(() => window.drawingEngine.drawings.length);
    console.log('Drawings count after clicking time axis (Must be 0):', countAfterTimeClick);

    // 4. Click on the LEFT TOOLBAR
    const leftToolBox = await page.locator('.tv-left-toolbar').boundingBox();
    if (leftToolBox) {
        console.log('Clicking inside left toolbar at:', leftToolBox.x + 20, leftToolBox.y + 200);
        await page.mouse.click(leftToolBox.x + 20, leftToolBox.y + 200);
        await page.waitForTimeout(50);
    }

    const countAfterToolbarClick = await page.evaluate(() => window.drawingEngine.drawings.length);
    console.log('Drawings count after clicking left toolbar (Must be 0):', countAfterToolbarClick);

    // 5. Drag the price axis vertically to zoom price height
    if (priceBox) {
        await page.mouse.move(priceBox.x + 20, priceBox.y + 200);
        await page.mouse.down();
        await page.mouse.move(priceBox.x + 20, priceBox.y + 300, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(50);
    }

    const countAfterPriceDrag = await page.evaluate(() => window.drawingEngine.drawings.length);
    console.log('Drawings count after dragging price axis (Must be 0):', countAfterPriceDrag);

    // 6. Finally draw inside the legitimate canvas viewport
    const canvasBox = await page.locator('#canvas-container').boundingBox();
    await page.mouse.click(canvasBox.x + 300, canvasBox.y + 250);
    await page.waitForTimeout(50);
    await page.mouse.click(canvasBox.x + 500, canvasBox.y + 350);
    await page.waitForTimeout(100);

    const countAfterValidDraw = await page.evaluate(() => window.drawingEngine.drawings.length);
    console.log('Drawings count after legitimate draw inside canvas (Must be 1):', countAfterValidDraw);

    await browser.close();

    if (countAfterPriceClick === 0 && countAfterTimeClick === 0 && countAfterToolbarClick === 0 && countAfterPriceDrag === 0 && countAfterValidDraw === 1) {
        console.log('\n--- VERIFICATION SUCCESS: All Boundaries and Event Isolations 100% Verified! ---');
    } else {
        throw new Error('Boundary isolation verification failed!');
    }
}

testBoundaryIsolation().catch(console.error);
