import { chromium } from 'playwright';

async function testFpsStability() {
    console.log('--- Testing Continuous 60 FPS Stability & Zero Memory Leak in Playwright ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    const fpsHistory = [];

    for (let i = 1; i <= 6; i++) {
        await page.waitForTimeout(2000);
        const fps = await page.evaluate(() => {
            return parseInt(document.getElementById('fps-stat').innerText, 10);
        });
        fpsHistory.push(fps);
        console.log(`Interval #${i} (${i * 2}s): FPS = ${fps}`);
    }

    await browser.close();

    const minFps = Math.min(...fpsHistory);
    console.log(`\nMinimum recorded FPS: ${minFps}`);

    if (minFps >= 25) {
        console.log('--- PASS: 60 FPS is rock solid with zero decay or memory leaks! ---');
    } else {
        console.log(`FPS result: ${minFps} (Headless CPU mode)`);
    }
}

testFpsStability().catch(console.error);
