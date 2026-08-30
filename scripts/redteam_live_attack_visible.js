import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runVisibleRedTeamAttack() {
    console.log('🚀 Launching VISIBLE Chrome Browser on Windows Desktop...');

    // 🖥️ HEADLESS: FALSE -> Opens real graphical window on user screen!
    const browser = await chromium.launch({
        headless: false,
        slowMo: 600, // visible delay between each action
        args: [
            '--enable-webgl',
            '--enable-gpu',
            '--ignore-gpu-blocklist',
            '--use-gl=angle',
            '--allow-file-access-from-files',
            '--start-maximized',
            '--auto-open-devtools-for-tabs' // Opens DevTools automatically!
        ]
    });

    const context = await browser.newContext({ viewport: null });
    const page = await context.newPage();

    // Hook WebGL on the fly
    await page.addInitScript(() => {
        window.__HACKER_LOGS__ = [];
        const originalShaderSource = WebGL2RenderingContext.prototype.shaderSource;
        WebGL2RenderingContext.prototype.shaderSource = function(shader, source) {
            window.__HACKER_LOGS__.push('🚨 WebGL Shader Hooked!');
            return originalShaderSource.apply(this, arguments);
        };
    });

    const targetUrl = `file:///${path.resolve(__dirname, '../dist-secured/index.html').replace(/\\/g, '/')}`;
    console.log(`Navigating to secured engine: ${targetUrl}`);
    await page.goto(targetUrl);
    await page.waitForTimeout(1500);

    console.log('1. Testing 🟡 Serbest Mode on screen...');
    await page.locator('#mode-btn-free').click();
    await page.waitForTimeout(1000);

    console.log('2. Testing 🟢 Kilitli Mode on screen...');
    await page.locator('#mode-btn-locked').click();
    await page.waitForTimeout(1000);

    console.log('3. Testing 🔵 İvmeli Mode on screen...');
    await page.locator('#mode-btn-velocity').click();
    await page.waitForTimeout(1000);

    console.log('4. Dragging Chart visibly...');
    const box = await page.locator('#chart-canvas').boundingBox();
    if (box) {
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;
        await page.mouse.move(cx, cy);
        await page.mouse.down();
        await page.mouse.move(cx - 350, cy, { steps: 15 });
        await page.mouse.up();
    }
    await page.waitForTimeout(1500);

    console.log('5. Pressing Space for Instant Auto-Fit on screen...');
    await page.keyboard.press('Space');
    await page.waitForTimeout(2000);

    console.log('6. Executing Zoom in/out...');
    if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.wheel(0, -300);
        await page.waitForTimeout(1500);
        await page.mouse.wheel(0, 300);
        await page.waitForTimeout(1500);
    }

    console.log('✅ Attack test finished! Leaving browser open for 6 seconds so user can inspect...');
    await page.waitForTimeout(6000);

    await browser.close();
    console.log('Browser closed cleanly.');
}

runVisibleRedTeamAttack().catch(err => {
    console.error(err);
    process.exit(1);
});
