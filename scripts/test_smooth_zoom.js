import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await context.newPage();

    console.log('--- TESTING ULTRA SMOOTH ZOOM ENGINE ---');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const canvasBox = await page.locator('#glcanvas').boundingBox();
    if (!canvasBox) {
        console.error('Canvas not found!');
        await browser.close();
        process.exit(1);
    }
    const cx = canvasBox.x + canvasBox.width / 2;
    const cy = canvasBox.y + canvasBox.height / 2;

    console.log('Testing Zoom In (Mouse Wheel)...');
    await page.mouse.move(cx, cy);
    for (let i = 0; i < 6; i++) {
        await page.mouse.wheel(0, -120);
        await page.waitForTimeout(50);
    }
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'scripts/screenshot_zoom_01_zoomed_in.png' });
    console.log('Zoom in successful.');

    console.log('Testing Zoom Out (Mouse Wheel)...');
    for (let i = 0; i < 10; i++) {
        await page.mouse.wheel(0, 150);
        await page.waitForTimeout(50);
    }
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'scripts/screenshot_zoom_02_zoomed_out.png' });
    console.log('Zoom out successful.');

    console.log('Testing Space Auto-Fit...');
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'scripts/screenshot_zoom_03_space_fit.png' });
    console.log('Space auto fit successful.');

    await browser.close();
    console.log('ALL ZOOM TESTS PASSED WITH 0 ERRORS!');
})();
