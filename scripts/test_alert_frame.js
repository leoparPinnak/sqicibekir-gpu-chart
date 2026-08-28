import { chromium } from 'playwright';

async function testAlertFrame() {
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    await page.mouse.move(700, 400);
    await page.mouse.down();
    for (let x = 650; x >= 400; x -= 30) {
        await page.mouse.move(x, 400);
        await page.waitForTimeout(10);
    }

    await page.screenshot({ path: 'scripts/threshold_alert_active_screenshot.png' });
    console.log('Saved active alert screenshot to scripts/threshold_alert_active_screenshot.png');

    await page.mouse.up();
    await browser.close();
}

testAlertFrame().catch(console.error);
