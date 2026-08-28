import { chromium } from 'playwright';
import fs from 'fs';

async function runComprehensiveDrawingToolSuiteTest() {
    console.log('🚀 Starting Comprehensive Drawing Tool Suite Automated Test in Playwright...');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    // Catch any console errors
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.error('Browser Console Error:', msg.text());
            consoleErrors.push(msg.text());
        }
    });

    page.on('pageerror', err => {
        console.error('Uncaught Page Error:', err.message);
        consoleErrors.push(err.message);
    });

    console.log('Navigating to http://localhost:5173 ...');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1500);

    // 1. Verify canvasContainer & DrawingEngine initialized
    const isEngineReady = await page.evaluate(() => {
        return window.drawingEngine !== undefined && window.drawingEngine !== null;
    });
    console.log('Drawing Engine initialized on window:', isEngineReady);

    // 2. Query all flyouts and tool buttons
    const flyoutData = await page.evaluate(() => {
        const flyouts = Array.from(document.querySelectorAll('.tv-flyout-menu'));
        const tools = Array.from(document.querySelectorAll('.tv-flyout-item'));
        return {
            flyoutCount: flyouts.length,
            flyoutIds: flyouts.map(f => f.id),
            toolCount: tools.length
        };
    });
    console.log('Flyout menus found:', flyoutData);

    // 3. Test every tool one by one:
    // Extract list of all tool names called in onclick="selectTvTool('...')"
    const allTools = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.tv-flyout-item, .tv-fav-item'));
        const toolNames = [];
        items.forEach(el => {
            const onclickStr = el.getAttribute('onclick') || '';
            const match = onclickStr.match(/selectTvTool\(['"]([^'"]+)['"]\)/);
            if (match && match[1] && !toolNames.includes(match[1])) {
                toolNames.push(match[1]);
            }
        });
        return toolNames;
    });

    console.log(`\nFound ${allTools.length} distinct tools to test:`, allTools);

    const testResults = [];
    const canvasBox = await page.locator('#canvas-container').boundingBox();

    if (!canvasBox) {
        throw new Error('Canvas container bounding box not found!');
    }

    const startX = canvasBox.x + 300;
    const startY = canvasBox.y + 250;
    const endX = canvasBox.x + 550;
    const endY = canvasBox.y + 380;

    for (let i = 0; i < allTools.length; i++) {
        const tool = allTools[i];
        console.log(`\n[${i + 1}/${allTools.length}] Testing Tool: "${tool}" ...`);

        try {
            // A. Select Tool
            await page.evaluate((t) => {
                window.selectTvTool(t);
            }, tool);

            const activeTool = await page.evaluate(() => window.drawingEngine.activeTool);

            // B. Draw on Canvas: Click 1 -> Move -> Click 2
            await page.mouse.move(startX, startY);
            await page.mouse.down();
            await page.mouse.up(); // Clean Click 1
            await page.waitForTimeout(50);

            await page.mouse.move(endX, endY);
            await page.waitForTimeout(50);

            await page.mouse.down();
            await page.mouse.up(); // Clean Click 2
            await page.waitForTimeout(100);

            // C. Check Engine State
            const state = await page.evaluate(() => {
                const drawings = window.drawingEngine.drawings;
                const last = drawings[drawings.length - 1];
                const propToolbar = document.getElementById('tv-prop-toolbar');
                return {
                    count: drawings.length,
                    lastType: last ? last.type : null,
                    lastPoints: last ? last.points : null,
                    hasSelected: !!window.drawingEngine.selectedDrawing,
                    propToolbarVisible: propToolbar ? propToolbar.style.display !== 'none' : false
                };
            });

            console.log(`  -> Result: Drawn Count=${state.count}, LastType=${state.lastType}, PropToolbar=${state.propToolbarVisible}`);

            testResults.push({
                tool,
                activeTool,
                success: state.count > 0 && state.lastType !== null,
                details: state
            });
        } catch (err) {
            console.error(`  -> Error testing tool ${tool}:`, err.message);
            testResults.push({ tool, success: false, error: err.message });
        }
    }

    // 4. Test Property Toolbar modifications (Color, Width, LineStyle)
    console.log('\n--- Testing Floating Property Toolbar Interactivity ---');
    const propToolbarTest = await page.evaluate(() => {
        if (window.drawingEngine.selectedDrawing) {
            window.setDrawingColor('#f59e0b');
            window.setDrawingWidth(4);
            window.setDrawingStyle('dashed');
            return {
                color: window.drawingEngine.selectedDrawing.style.color,
                width: window.drawingEngine.selectedDrawing.style.width,
                style: window.drawingEngine.selectedDrawing.style.lineStyle
            };
        }
        return null;
    });
    console.log('Property Toolbar result:', propToolbarTest);

    // 5. Test Shape Dragging & Handle Manipulation
    console.log('\n--- Testing Shape Dragging and Handle Hit-Testing ---');
    await page.evaluate(() => window.selectTvTool('cursor'));
    
    // Move mouse over shape and check hover
    await page.mouse.move(startX + 50, startY + 50);
    await page.waitForTimeout(50);
    const hoverState = await page.evaluate(() => {
        return {
            hoveredDrawing: !!window.drawingEngine.hoveredDrawing,
            cursor: window.canvasContainer.style.cursor
        };
    });
    console.log('Hover state:', hoverState);

    // Drag shape
    await page.mouse.down();
    await page.mouse.move(startX + 120, startY + 120, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(50);

    // 6. Test Delete All
    console.log('\n--- Testing Clear All Drawings ---');
    await page.evaluate(() => window.deleteTvDrawings());
    const countAfterDelete = await page.evaluate(() => window.drawingEngine.drawings.length);
    console.log('Drawings count after delete all:', countAfterDelete);

    // 7. Take final screenshot
    await page.screenshot({ path: 'scripts/drawing_tools_test_screenshot.png' });
    console.log('Screenshot saved to scripts/drawing_tools_test_screenshot.png');

    await browser.close();

    console.log('\n========================================');
    console.log('TEST SUMMARY:');
    const passed = testResults.filter(r => r.success).length;
    const failed = testResults.filter(r => !r.success).length;
    console.log(`Total Tested: ${testResults.length} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
        console.log('Console Errors:', consoleErrors);
    }
    console.log('========================================\n');
}

runComprehensiveDrawingToolSuiteTest().catch(console.error);
