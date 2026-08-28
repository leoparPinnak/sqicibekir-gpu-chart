import { chromium } from 'playwright';

async function testCanvasScreenshot() {
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);

    const canvasBox = await page.locator('#canvas-container').boundingBox();
    console.log('Canvas Box:', canvasBox);

    await page.screenshot({ path: 'scripts/clean_chart_viewport.png' });
    console.log('Saved screenshot to scripts/clean_chart_viewport.png');

    await browser.close();
}

testCanvasScreenshot().catch(console.error);
