import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runLiveVisualDemo() {
    console.log('🚀 Launching VISIBLE Chromium Browser on Desktop...');

    // headless: false -> Opens actual visible browser window on user desktop!
    const browser = await chromium.launch({
        headless: false,
        slowMo: 300,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle', '--allow-file-access-from-files', '--start-maximized']
    });

    const context = await browser.newContext({ viewport: null });
    const page = await context.newPage();

    const targetUrl = `file:///${path.resolve(__dirname, '../dist-secured/index.html').replace(/\\/g, '/')}`;
    console.log(`Navigating to: ${targetUrl}`);

    await page.goto(targetUrl);
    await page.waitForTimeout(2000);

    console.log('1. Interacting with 3-Scale Modes...');
    await page.locator('#mode-btn-free').click();
    await page.waitForTimeout(1000);

    await page.locator('#mode-btn-locked').click();
    await page.waitForTimeout(1000);

    await page.locator('#mode-btn-velocity').click();
    await page.waitForTimeout(1000);

    console.log('2. Opening Indicators Modal (fx)...');
    await page.locator('#btn-indicators-modal').click();
    await page.waitForTimeout(2000);

    console.log('3. Closing Modal...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    console.log('4. Dragging Chart...');
    const box = await page.locator('#chart-canvas').boundingBox();
    if (box) {
        await page.mouse.move(box.x + 600, box.y + 400);
        await page.mouse.down();
        await page.mouse.move(box.x + 300, box.y + 400, { steps: 10 });
        await page.mouse.up();
    }
    await page.waitForTimeout(2000);

    console.log('5. Pressing Space for Auto-Fit...');
    await page.keyboard.press('Space');
    await page.waitForTimeout(2500);

    console.log('Visible Demo Finished!');
    await browser.close();
}

runLiveVisualDemo().catch(err => {
    console.error(err);
    process.exit(1);
});
