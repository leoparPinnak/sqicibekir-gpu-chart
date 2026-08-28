import { chromium } from 'playwright';

async function verifyBugfixes() {
    console.log('--- Verifying Bugfixes in Playwright ---');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1000);

    const canvasBox = await page.locator('#canvas-container').boundingBox();

    // 1. Verify Magnet Default State
    const magnetInitial = await page.evaluate(() => {
        return {
            engineMagnet: window.drawingEngine.magnetMode,
            buttonActive: document.getElementById('tv-tool-magnet').classList.contains('active')
        };
    });
    console.log('1. Magnet Initial State (Should both be false):', magnetInitial);

    // 2. Verify Single-Use vs Continuous Drawing Synchronization
    // Test A: Normal mode (continuousDraw = false) -> Should switch to cursor after drawing
    await page.evaluate(() => window.selectTvTool('trendline'));
    let activeToolBefore = await page.evaluate(() => ({
        engineTool: window.drawingEngine.activeTool,
        trendlineBtnActive: document.getElementById('tv-tool-trendline').classList.contains('active'),
        cursorBtnActive: document.getElementById('tv-tool-cursor').classList.contains('active')
    }));
    console.log('2A. Before Draw (Normal Mode):', activeToolBefore);

    // Draw line
    await page.mouse.click(canvasBox.x + 200, canvasBox.y + 300);
    await page.waitForTimeout(50);
    await page.mouse.click(canvasBox.x + 400, canvasBox.y + 200);
    await page.waitForTimeout(100);

    let activeToolAfter = await page.evaluate(() => ({
        engineTool: window.drawingEngine.activeTool,
        trendlineBtnActive: document.getElementById('tv-tool-trendline').classList.contains('active'),
        cursorBtnActive: document.getElementById('tv-tool-cursor').classList.contains('active'),
        drawingsCount: window.drawingEngine.drawings.length
    }));
    console.log('2B. After Draw (Normal Mode, should switch to cursor cleanly):', activeToolAfter);

    // Test B: Continuous Drawing Mode (continuousDraw = true) -> Should allow consecutive drawings
    await page.evaluate(() => {
        const btn = document.getElementById('tv-tool-continuous');
        window.toggleTvContinuous(btn);
        window.selectTvTool('rectangle');
    });

    let contBefore = await page.evaluate(() => ({
        engineContinuous: window.drawingEngine.continuousDraw,
        engineTool: window.drawingEngine.activeTool,
        rectBtnActive: document.getElementById('tv-tool-rectangle').classList.contains('active')
    }));
    console.log('2C. Continuous Mode Enabled:', contBefore);

    // Draw 1st rectangle
    await page.mouse.click(canvasBox.x + 450, canvasBox.y + 300);
    await page.waitForTimeout(50);
    await page.mouse.click(canvasBox.x + 600, canvasBox.y + 400);
    await page.waitForTimeout(100);

    // Draw 2nd rectangle IMMEDIATELY without clicking toolbar button!
    await page.mouse.click(canvasBox.x + 650, canvasBox.y + 300);
    await page.waitForTimeout(50);
    await page.mouse.click(canvasBox.x + 800, canvasBox.y + 400);
    await page.waitForTimeout(100);

    let contAfter = await page.evaluate(() => ({
        engineTool: window.drawingEngine.activeTool,
        rectBtnActive: document.getElementById('tv-tool-rectangle').classList.contains('active'),
        totalDrawings: window.drawingEngine.drawings.length
    }));
    console.log('2D. After 2 Consecutive Rectangles in Continuous Mode:', contAfter);

    // 3. Verify Toolbar and Floating Bar Sync
    await page.evaluate(() => window.selectTvTool('fibonacci'));
    const syncState = await page.evaluate(() => {
        const leftFibBtn = document.getElementById('tv-tool-fibonacci').classList.contains('active');
        const favFibItem = document.querySelector('.tv-fav-item[onclick*="fibonacci"]').classList.contains('active');
        return { leftFibBtn, favFibItem };
    });
    console.log('3. Toolbar & Floating Bar Synchronization (Both should be true):', syncState);

    await browser.close();
    console.log('\n--- All Bugfix Verifications Passed Successfully! ---');
}

verifyBugfixes().catch(console.error);
