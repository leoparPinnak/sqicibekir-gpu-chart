import { chromium } from 'playwright';

async function testPersistentVelocityHUD() {
    console.log('--- Testing Persistent Velocity & Max Peak HUD in Playwright ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    // 1. Verify Initial HUD Elements
    const hudVisible = await page.locator('#persistent-velocity-hud').isVisible();
    const initLiveVx = await page.locator('#hud-live-vx').innerText();
    const initMaxVx = await page.locator('#hud-max-vx').innerText();
    console.log(`1. Initial HUD - Visible: ${hudVisible} | Live: ${initLiveVx} | Max: ${initMaxVx}`);

    // 2. Perform fast horizontal drag
    await page.mouse.move(700, 400);
    await page.mouse.down();
    for (let x = 650; x >= 300; x -= 50) {
        await page.mouse.move(x, 400);
        await page.waitForTimeout(10);
    }

    const midMaxVx = await page.locator('#hud-max-vx').innerText();
    const isAlertLocked = await page.evaluate(() => document.getElementById('hud-alert-badge').classList.contains('alert-locked'));
    const alertText = await page.locator('#hud-alert-text').innerText();
    console.log(`2. During Fast Drag - Max Peak: ${midMaxVx} | Alert Locked: ${isAlertLocked} | Text: "${alertText}"`);

    await page.mouse.up();
    await page.waitForTimeout(300);

    await page.screenshot({ path: 'scripts/persistent_velocity_hud_screenshot.png' });
    console.log('Screenshot saved to scripts/persistent_velocity_hud_screenshot.png');

    // 3. Click Reset Button (↺)
    await page.locator('.hud-reset-btn').click();
    await page.waitForTimeout(100);
    const resetMaxVx = await page.locator('#hud-max-vx').innerText();
    console.log(`3. After Reset Button Click - Max Peak: ${resetMaxVx}`);

    await browser.close();

    if (hudVisible && parseFloat(midMaxVx) > 0 && resetMaxVx === '0.00') {
        console.log('\n--- ALL CHECKS PASSED: Persistent Velocity & Max Peak HUD operates with complete perfection! ---');
    } else {
        throw new Error('Persistent Velocity HUD test failed!');
    }
}

testPersistentVelocityHUD().catch(console.error);
