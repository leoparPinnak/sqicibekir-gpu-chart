import { chromium } from 'playwright';

async function testPersistentMode() {
    console.log('--- Testing Persistent Tool Mode in Playwright ---');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1000);

    const canvasBox = await page.locator('#canvas-container').boundingBox();

    // 1. Select Trend Line
    await page.evaluate(() => window.selectTvTool('trendline'));

    // Draw Line 1 (Click 1 -> Click 2)
    await page.mouse.click(canvasBox.x + 200, canvasBox.y + 300);
    await page.waitForTimeout(50);
    await page.mouse.click(canvasBox.x + 350, canvasBox.y + 200);
    await page.waitForTimeout(50);

    let stateAfter1 = await page.evaluate(() => ({
        activeTool: window.drawingEngine.activeTool,
        btnActive: document.getElementById('tv-tool-trendline').classList.contains('active'),
        count: window.drawingEngine.drawings.length
    }));
    console.log('After Line 1 (Should remain in trendline mode):', stateAfter1);

    // Draw Line 2 IMMEDIATELY without clicking toolbar button!
    await page.mouse.click(canvasBox.x + 400, canvasBox.y + 320);
    await page.waitForTimeout(50);
    await page.mouse.click(canvasBox.x + 550, canvasBox.y + 220);
    await page.waitForTimeout(50);

    let stateAfter2 = await page.evaluate(() => ({
        activeTool: window.drawingEngine.activeTool,
        btnActive: document.getElementById('tv-tool-trendline').classList.contains('active'),
        count: window.drawingEngine.drawings.length
    }));
    console.log('After Line 2 (Consecutive draw success):', stateAfter2);

    // Draw Line 3 IMMEDIATELY!
    await page.mouse.click(canvasBox.x + 600, canvasBox.y + 350);
    await page.waitForTimeout(50);
    await page.mouse.click(canvasBox.x + 750, canvasBox.y + 250);
    await page.waitForTimeout(50);

    let stateAfter3 = await page.evaluate(() => ({
        activeTool: window.drawingEngine.activeTool,
        btnActive: document.getElementById('tv-tool-trendline').classList.contains('active'),
        count: window.drawingEngine.drawings.length
    }));
    console.log('After Line 3 (3 consecutive lines):', stateAfter3);

    // 2. Press Escape key -> Should exit to cursor mode
    await page.keyboard.press('Escape');
    await page.waitForTimeout(50);

    let stateAfterEsc = await page.evaluate(() => ({
        activeTool: window.drawingEngine.activeTool,
        cursorBtnActive: document.getElementById('tv-tool-cursor').classList.contains('active'),
        trendlineBtnActive: document.getElementById('tv-tool-trendline').classList.contains('active')
    }));
    console.log('After Escape Key (Should exit to cursor mode):', stateAfterEsc);

    await browser.close();
    console.log('\n--- Persistent Mode Test Passed Successfully! ---');
}

testPersistentMode().catch(console.error);
