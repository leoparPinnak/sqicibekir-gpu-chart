import { chromium } from 'playwright';

async function testDynamicAutofit() {
    console.log('--- Testing Dynamic Auto-Fit on Horizontal Timeline Navigation in Playwright ---');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    const canvasBox = await page.locator('#canvas-container').boundingBox();

    // 1. Initial State (Auto-Fit Active)
    const p1 = await page.evaluate(() => ({
        viewStart: window.drawingEngine.getViewRange().start.toFixed(1),
        viewEnd: window.drawingEngine.getViewRange().end.toFixed(1),
        minPrice: window.drawingEngine.getPriceRange().min.toFixed(2),
        maxPrice: window.drawingEngine.getPriceRange().max.toFixed(2)
    }));
    console.log('1. Initial Auto-Fit State (Rightmost candles):', p1);

    // 2. Pan HORIZONTALLY back in time by 800px (to view past candles)
    await page.mouse.move(canvasBox.x + 300, canvasBox.y + 400);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + 1000, canvasBox.y + 400, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    const p2 = await page.evaluate(() => ({
        viewStart: window.drawingEngine.getViewRange().start.toFixed(1),
        viewEnd: window.drawingEngine.getViewRange().end.toFixed(1),
        minPrice: window.drawingEngine.getPriceRange().min.toFixed(2),
        maxPrice: window.drawingEngine.getPriceRange().max.toFixed(2)
    }));
    console.log('2. After Horizontal Pan Backwards (Price automatically adapted to visible candles):', p2);

    // 3. Pan deliberately VERTICALLY down by 200px
    await page.mouse.move(canvasBox.x + 500, canvasBox.y + 200);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + 500, canvasBox.y + 450, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    const p3 = await page.evaluate(() => ({
        minPrice: window.drawingEngine.getPriceRange().min.toFixed(2),
        maxPrice: window.drawingEngine.getPriceRange().max.toFixed(2)
    }));
    console.log('3. After Deliberate Vertical Pan (Manual Mode):', p3);

    // 4. Click OTO button to restore Auto-Fit
    const otoBtn = await page.locator('.axis-corner-reset');
    await otoBtn.click();
    await page.waitForTimeout(300);

    const p4 = await page.evaluate(() => ({
        minPrice: window.drawingEngine.getPriceRange().min.toFixed(2),
        maxPrice: window.drawingEngine.getPriceRange().max.toFixed(2)
    }));
    console.log('4. After Clicking OTO Button (Restored Auto-Fit):', p4);

    await page.screenshot({ path: 'scripts/dynamic_autofit_screenshot.png' });
    console.log('Saved screenshot to scripts/dynamic_autofit_screenshot.png');

    await browser.close();
    console.log('\n--- Dynamic Auto-Fit Test Passed Successfully! ---');
}

testDynamicAutofit().catch(console.error);
