import { chromium } from 'playwright';

async function testVisualDrawings() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1500);

    const canvasBox = await page.locator('#canvas-container').boundingBox();

    // 1. Draw a Trendline
    await page.evaluate(() => window.selectTvTool('trendline'));
    await page.mouse.click(canvasBox.x + 250, canvasBox.y + 400);
    await page.waitForTimeout(50);
    await page.mouse.click(canvasBox.x + 480, canvasBox.y + 220);
    await page.waitForTimeout(100);

    // 2. Draw a Fibonacci Retracement
    await page.evaluate(() => window.selectTvTool('fibonacci'));
    await page.mouse.click(canvasBox.x + 500, canvasBox.y + 200);
    await page.waitForTimeout(50);
    await page.mouse.click(canvasBox.x + 750, canvasBox.y + 550);
    await page.waitForTimeout(100);

    // 3. Draw a Long Position
    await page.evaluate(() => window.selectTvTool('long_pos'));
    await page.mouse.click(canvasBox.x + 800, canvasBox.y + 420);
    await page.waitForTimeout(50);
    await page.mouse.click(canvasBox.x + 980, canvasBox.y + 280);
    await page.waitForTimeout(100);

    // 4. Draw a Price Range / Measure Box
    await page.evaluate(() => window.selectTvTool('price_range'));
    await page.mouse.click(canvasBox.x + 1020, canvasBox.y + 500);
    await page.waitForTimeout(50);
    await page.mouse.click(canvasBox.x + 1200, canvasBox.y + 320);
    await page.waitForTimeout(100);

    // 5. Draw a Rectangle
    await page.evaluate(() => window.selectTvTool('rectangle'));
    await page.mouse.click(canvasBox.x + 300, canvasBox.y + 600);
    await page.waitForTimeout(50);
    await page.mouse.click(canvasBox.x + 450, canvasBox.y + 700);
    await page.waitForTimeout(100);

    // Take screenshot with all shapes visible
    await page.screenshot({ path: 'scripts/active_drawings_screenshot.png' });
    console.log('Saved screenshot to scripts/active_drawings_screenshot.png');

    await browser.close();
}

testVisualDrawings().catch(console.error);
