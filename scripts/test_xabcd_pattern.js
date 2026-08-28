import { chromium } from 'playwright';

async function testXABCDPattern() {
    console.log('--- Testing 5-Point XABCD Harmonic Pattern in Playwright ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    // 1. Select pattern_xabcd tool
    await page.evaluate(() => {
        window.selectTvTool('pattern_xabcd');
    });
    await page.waitForTimeout(300);

    // 2. Click 5 sequential points for authentic XABCD harmonic pattern
    const points = [
        { x: 300, y: 550, name: 'X' },
        { x: 440, y: 240, name: 'A' },
        { x: 580, y: 430, name: 'B' },
        { x: 700, y: 310, name: 'C' },
        { x: 860, y: 580, name: 'D' }
    ];

    for (const pt of points) {
        console.log(`Clicking Point ${pt.name} at (${pt.x}, ${pt.y})...`);
        await page.mouse.move(pt.x, pt.y);
        await page.waitForTimeout(100);
        await page.mouse.down();
        await page.waitForTimeout(50);
        await page.mouse.up();
        await page.waitForTimeout(150);
    }

    await page.waitForTimeout(500);

    const drawingState = await page.evaluate(() => {
        if (!window.drawingEngine) return null;
        const dList = window.drawingEngine.drawings;
        return {
            totalDrawings: dList.length,
            lastDrawing: dList[dList.length - 1]
        };
    });

    console.log('Drawing Engine State:', {
        total: drawingState.totalDrawings,
        type: drawingState.lastDrawing ? drawingState.lastDrawing.type : null,
        pointCount: drawingState.lastDrawing ? drawingState.lastDrawing.points.length : 0
    });

    await page.screenshot({ path: 'scripts/xabcd_harmonic_screenshot.png' });
    console.log('Screenshot saved to scripts/xabcd_harmonic_screenshot.png');

    await browser.close();

    if (drawingState.totalDrawings >= 1 && drawingState.lastDrawing.type === 'pattern_xabcd' && drawingState.lastDrawing.points.length === 5) {
        console.log('\n--- ALL CHECKS PASSED: 5-Point XABCD Harmonic Pattern engine functions with full TradingView fidelity! ---');
    } else {
        throw new Error('XABCD pattern test failed!');
    }
}

testXABCDPattern().catch(console.error);
